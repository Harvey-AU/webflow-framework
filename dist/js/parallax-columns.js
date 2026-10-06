/**
 * Parallax columns
 *
 * A hero above a grid of items laid out in columns, in the style of
 * this.design. The hero and grid fade up into place on load. Scrolling, the
 * hero stays put and its fade element fades out while the grid rises over
 * it. Each column starts pushed away from the centre of the screen and
 * eases back in as it rises. Columns start at staggered heights and drift
 * until their bottoms line up at the end of the grid. Items are images or
 * muted looping videos.
 *
 * Load standalone on pages that need it (not part of main.js):
 *   <script src="https://webflow.teamharvey.co/js/parallax-columns.js" defer></script>
 *
 * Markup (attribute prefix data-parallax-columns):
 *   [data-parallax-columns]            Section. Optional settings below.
 *     [-hero]                          The hero, styled at its resting height
 *                                      (75svh suits). Stays pinned while the
 *                                      grid scrolls over it.
 *       [-fade]                        Fades out over the hero's height. A
 *                                      backdrop starts below it and fades
 *                                      out with it.
 *     [-grid]                          Follows the hero. Style its padding
 *                                      and max width; the script builds
 *                                      columns inside it.
 *       CMS list                       In display order. Hidden once its
 *                                      items are moved into the columns.
 *         [-item]                      One collection item. Add -video
 *                                      bound to a video URL field to play an
 *                                      .mp4 over the image.
 *           img[-media]                Image, or the video's poster.
 *
 * Settings on [data-parallax-columns]:
 *   -mobile="2"                        Columns under the first breakpoint.
 *   -breakpoints="768:3,1024:4,1280:5,1920:6,2560:7"
 *                                      Columns from each minimum screen
 *                                      width.
 *   -gap="20"                          Gap between items in px (12 at the
 *                                      mobile column count).
 *   -ratio="25 / 34"                   Item aspect ratio, width / height.
 *   -strength="1"                      Motion multiplier, 0 turns it off.
 *   -backdrop="#f5f5f5"                Backdrop colour, "none" turns it off.
 *   -backdrop-offset="56"              Gap between the fade element and the
 *                                      backdrop in px.
 *
 * With reduced motion the grid is laid out the same but nothing moves, fades
 * or autoplays.
 */
(function () {
  "use strict";

  const debug = window.WebflowFramework?.debug || function () {};

  const DEFAULT_BREAKPOINTS = "768:3,1024:4,1280:5,1920:6,2560:7";
  // Space above the first item of each column, as a share of the column
  // width, in a repeating pattern that reads as random. Columns start at
  // uneven heights and drift until their bottoms line up.
  const COLUMN_HEADS = [0.2, 0.55, 0, 0.35, 0.7, 0.1, 0.45, 0.25];
  // How far a column starts from its place, per unit of its distance from
  // the centre of the screen, in column widths
  const SPREAD = 1.5;

  const EASE_OUT = "cubic-bezier(.215,.61,.355,1)"; // power3.out
  const CSS = `
[data-parallax-columns]{position:relative;overflow-x:clip}
[data-parallax-columns-hero]{position:relative}
.parallax-columns-backdrop{position:absolute;left:0;right:0;height:100lvh;pointer-events:none}
[data-parallax-columns].is-parallax-columns-motion .parallax-columns-backdrop{will-change:opacity}
[data-parallax-columns].is-parallax-columns-motion [data-parallax-columns-hero]{position:sticky;top:0}
[data-parallax-columns].is-parallax-columns-motion [data-parallax-columns-fade]{will-change:opacity}
[data-parallax-columns-grid]{position:relative;z-index:1}
[data-parallax-columns].is-parallax-columns-motion [data-parallax-columns-hero],[data-parallax-columns].is-parallax-columns-motion [data-parallax-columns-grid]{opacity:0;transform:translate3d(0,40px,0)}
[data-parallax-columns].is-parallax-columns-in [data-parallax-columns-hero],[data-parallax-columns].is-parallax-columns-in [data-parallax-columns-grid]{opacity:1;transform:none;transition:opacity 1s ${EASE_OUT},transform 1s ${EASE_OUT}}
[data-parallax-columns].is-parallax-columns-in [data-parallax-columns-hero]{transition-delay:.25s}
[data-parallax-columns].is-parallax-columns-in [data-parallax-columns-grid]{transition-delay:.5s}
.parallax-columns-track{display:grid;grid-template-columns:repeat(var(--parallax-columns-count),minmax(0,1fr));gap:var(--parallax-columns-gap)}
.parallax-columns-column{min-width:0}
.parallax-columns-column-inner{display:flex;flex-direction:column;gap:var(--parallax-columns-gap)}
[data-parallax-columns].is-parallax-columns-motion .parallax-columns-column,[data-parallax-columns].is-parallax-columns-motion .parallax-columns-column-inner{will-change:transform}
.parallax-columns-column-head{flex:none}
.parallax-columns-track [data-parallax-columns-item]{position:relative;margin:0;overflow:hidden;aspect-ratio:var(--parallax-columns-ratio);contain:layout paint}
[data-parallax-columns-item] img,[data-parallax-columns-item] video{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none;-webkit-user-drag:none;user-select:none}
[data-parallax-columns-item] video{position:absolute;inset:0}
[data-parallax-columns].is-parallax-columns-motion [data-parallax-columns-media]{opacity:0;transition:opacity .4s ease}
[data-parallax-columns].is-parallax-columns-motion [data-parallax-columns-media].is-parallax-columns-loaded{opacity:1}`;

  function injectStyles() {
    if (document.getElementById("parallax-columns-styles")) return;
    const style = document.createElement("style");
    style.id = "parallax-columns-styles";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function numberAttr(el, name, fallback) {
    const value = parseFloat(el.getAttribute(name));
    return Number.isFinite(value) ? value : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // "768:3,1024:4" -> [{ minWidth: 768, columns: 3 }, ...], narrowest first
  function parseBreakpoints(value) {
    return value
      .split(",")
      .map((pair) => pair.split(":").map((part) => parseInt(part, 10)))
      .filter(([minWidth, columns]) => minWidth > 0 && columns > 0)
      .map(([minWidth, columns]) => ({ minWidth, columns }))
      .sort((a, b) => a.minWidth - b.minWidth);
  }

  // Webflow marks empty CMS bindings with a class rather than removing them
  function isPresent(el) {
    return !!el && !el.classList.contains("w-condition-invisible") && !el.classList.contains("w-dyn-bind-empty");
  }

  function prepareItem(el) {
    const img = el.querySelector("img[data-parallax-columns-media]");
    el.querySelectorAll("img").forEach((image) => {
      image.alt = "";
      image.draggable = false;
    });

    const videoUrl = (el.getAttribute("data-parallax-columns-video") || "").trim();
    if (videoUrl && !el.querySelector("video")) {
      const video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "none";
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("aria-hidden", "true");
      if (isPresent(img) && img.getAttribute("src")) video.poster = img.getAttribute("src");
      video.src = videoUrl;
      el.appendChild(video);
    }
    return el;
  }

  // Fade each image in once it has loaded
  function revealWhenLoaded(img) {
    if (!img || img.classList.contains("is-parallax-columns-loaded")) return;
    const show = () => img.classList.add("is-parallax-columns-loaded");
    if (img.complete && img.naturalWidth) show();
    else {
      img.addEventListener("load", show, { once: true });
      img.addEventListener("error", show, { once: true });
    }
  }

  // Distance from an element's top or left edge to its ancestor's, ignoring
  // transforms
  function offsetWithin(el, ancestor, axis) {
    let total = 0;
    while (el && el !== ancestor) {
      total += axis === "x" ? el.offsetLeft : el.offsetTop;
      el = el.offsetParent;
    }
    return total;
  }

  function createParallaxColumns(section) {
    const hero = section.querySelector("[data-parallax-columns-hero]");
    const fader = section.querySelector("[data-parallax-columns-fade]");
    const grid = section.querySelector("[data-parallax-columns-grid]");
    if (!grid) {
      debug("parallax-columns", "init", "Missing [data-parallax-columns-grid]", "warn");
      return;
    }

    const items = Array.from(grid.querySelectorAll("[data-parallax-columns-item]")).map(prepareItem);
    if (!items.length) {
      debug("parallax-columns", "init", "No [data-parallax-columns-item] items found", "warn");
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const settings = {
      columnsMobile: Math.max(1, Math.round(numberAttr(section, "data-parallax-columns-mobile", 2))),
      breakpoints: parseBreakpoints(section.getAttribute("data-parallax-columns-breakpoints") || DEFAULT_BREAKPOINTS),
      gap: numberAttr(section, "data-parallax-columns-gap", null),
      ratio: (section.getAttribute("data-parallax-columns-ratio") || "25 / 34").trim(),
      strength: Math.max(0, numberAttr(section, "data-parallax-columns-strength", 1)),
      backdrop: (section.getAttribute("data-parallax-columns-backdrop") || "#f5f5f5").trim(),
      backdropOffset: numberAttr(section, "data-parallax-columns-backdrop-offset", 56),
    };
    const motion = !reducedMotion && settings.strength > 0;

    // The columns replace the CMS list, which stays in place but empty
    const list = items[0].closest(".w-dyn-list") || items[0].parentElement;
    const container = document.createElement("div");
    container.className = "parallax-columns-track";
    container.style.setProperty("--parallax-columns-ratio", settings.ratio);
    container.setAttribute("aria-hidden", "true");
    list.parentNode.insertBefore(container, list);
    list.style.display = "none";

    if (motion) section.classList.add("is-parallax-columns-motion");

    // Sits behind the grid, which rises over it
    let backdrop = null;
    if (hero && settings.backdrop !== "none") {
      backdrop = document.createElement("div");
      backdrop.className = "parallax-columns-backdrop";
      backdrop.setAttribute("aria-hidden", "true");
      backdrop.style.background = settings.backdrop;
      hero.prepend(backdrop);
    }

    // Videos play only while on screen, and never with reduced motion
    const videoObserver =
      !reducedMotion && "IntersectionObserver" in window
        ? new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              const video = entry.target;
              if (entry.isIntersecting) {
                if (video.preload === "none") video.preload = "auto";
                video.play().catch(() => {});
              } else {
                video.pause();
              }
            });
          })
        : null;
    items.forEach((item) => {
      if (videoObserver) item.querySelectorAll("video").forEach((video) => videoObserver.observe(video));
      if (motion) revealWhenLoaded(item.querySelector("[data-parallax-columns-media]"));
    });

    let columns = [];
    let viewportWidth = 0;
    let viewportHeight = 0;

    function columnCount(width) {
      let count = settings.columnsMobile;
      settings.breakpoints.forEach((bp) => {
        if (width >= bp.minWidth) count = bp.columns;
      });
      return count;
    }

    // Deal the items out like this.design: even columns first, then odd, so
    // neighbouring items in Order land apart
    function build(count) {
      const indices = Array.from({ length: count }, (_, i) => i);
      const order = [...indices.filter((i) => i % 2 === 0), ...indices.filter((i) => i % 2 !== 0)];
      container.textContent = "";
      columns = indices.map((i) => {
        const el = document.createElement("div");
        el.className = "parallax-columns-column";
        const inner = document.createElement("div");
        inner.className = "parallax-columns-column-inner";
        el.appendChild(inner);
        container.appendChild(el);
        return { el, inner, headShare: COLUMN_HEADS[i % COLUMN_HEADS.length] };
      });
      items.forEach((item, i) => columns[order[i % count]].inner.appendChild(item));
      columns.forEach((column) => {
        // The first row shows on load
        const first = column.inner.firstElementChild?.querySelector("img");
        column.head = document.createElement("div");
        column.head.className = "parallax-columns-column-head";
        column.inner.prepend(column.head);
        if (first) first.loading = "eager";
      });
    }

    function measure() {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      const count = columnCount(viewportWidth);
      if (count !== columns.length) build(count);

      const gap = settings.gap !== null ? settings.gap : count === settings.columnsMobile ? 12 : 20;
      container.style.setProperty("--parallax-columns-count", String(count));
      container.style.setProperty("--parallax-columns-gap", `${gap}px`);

      columns.forEach((column) => {
        column.head.style.height = `${column.el.offsetWidth * column.headShare}px`;
      });
      if (backdrop) {
        const top = fader ? offsetWithin(fader, hero, "y") + fader.offsetHeight : 0;
        backdrop.style.top = `${top + settings.backdropOffset}px`;
      }
      const sectionLeft = section.getBoundingClientRect().left;
      columns.forEach((column) => {
        column.top = offsetWithin(column.el, section, "y");
        column.width = column.el.offsetWidth;
        column.center = sectionLeft + offsetWithin(column.el, section, "x") + column.width / 2;
        column.height = column.el.offsetHeight;
        column.innerHeight = column.inner.offsetHeight;
        column.inner.querySelectorAll("img[srcset]").forEach((img) => {
          img.sizes = `${Math.ceil(column.width)}px`;
        });
      });
      render();
      debug("parallax-columns", "layout", `${count} columns, ${items.length} items`, "info");
    }

    // Scroll-linked motion, same curves as this.design's ScrollTrigger setup
    function render() {
      if (!motion) return;
      const sectionTop = section.getBoundingClientRect().top;
      const vw = viewportWidth;
      const vh = viewportHeight;
      const strength = settings.strength;

      columns.forEach((column) => {
        const top = sectionTop + column.top;

        // From the column's top entering the screen to a screen above it,
        // it eases in from beside its place, further out the further it is
        // from the centre
        const spreadProgress = clamp((vh - top) / (2 * vh), 0, 1);
        const start = ((vw / 2 - column.center) / vw) * column.width * -SPREAD * strength;
        const x = start * (1 - easeOut(spreadProgress));

        // From the column's top reaching halfway up the screen until its
        // bottom reaches the bottom of the screen, its items drift down so
        // every column ends flush with the bottom of the grid
        const driftDistance = Math.max(column.height - vh / 2, 1);
        const driftProgress = clamp((vh / 2 - top) / driftDistance, 0, 1);
        const y = (column.height - column.innerHeight) * driftProgress * strength;

        column.el.style.transform = `translate3d(${x}px,0,0)`;
        column.inner.style.transform = `translate3d(0,${y}px,0)`;
      });

      if (hero) {
        // Fades as the grid rises from the bottom of the hero to the top of
        // the screen
        const fade = 1 - easeOut(clamp(-sectionTop / hero.offsetHeight, 0, 1));
        if (fader) fader.style.opacity = String(fade);
        if (backdrop) backdrop.style.opacity = String(fade);
      }
    }

    if (motion) {
      window.addEventListener("scroll", render, { passive: true });
      // Lenis moves the page inside its own frame loop; follow it there so
      // the grid never trails the page by a frame
      const followLenis = () => {
        const lenis = window.WebflowFramework?.lenis;
        if (lenis && typeof lenis.on === "function") lenis.on("scroll", render);
      };
      if (window.WebflowFramework?.lenis) followLenis();
      else document.addEventListener("smoothScrollReady", followLenis, { once: true });
    }

    let resizeFrame = null;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    window.addEventListener("resize", () => {
      // Ignore height-only changes from mobile browser bars
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === lastWidth && Math.abs(h - lastHeight) < 120) return;
      lastWidth = w;
      lastHeight = h;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(measure);
    });

    measure();
    // Web fonts can change the hero's height and so where the grid starts
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    window.addEventListener("load", measure, { once: true });

    // Fade in once the first layout has painted
    if (motion) {
      requestAnimationFrame(() => requestAnimationFrame(() => section.classList.add("is-parallax-columns-in")));
    }

    debug("parallax-columns", "init", `Ready with ${items.length} items`, "info");
  }

  function init() {
    try {
      injectStyles();
      document.querySelectorAll("[data-parallax-columns]").forEach((section) => {
        try {
          createParallaxColumns(section);
        } catch (error) {
          console.error("Parallax columns failed to start:", error);
        }
      });
    } catch (error) {
      console.error("Parallax columns failed to load:", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
