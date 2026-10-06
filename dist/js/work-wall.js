/**
 * Work wall
 *
 * A hero of client work in the style of this.design. The heading sits at the
 * top of the screen and the wall's first row peeks in along the bottom, every
 * column top aligned. Both fade up into place on load. Scrolling, the heading
 * stays put and fades out while the wall rises over it. Each column starts
 * pushed away from the centre of the screen and eases back in as it rises,
 * and shorter columns drift down so the columns fall out of line and land
 * bottom aligned. Tiles are images or muted looping videos.
 *
 * Load standalone on pages that need it (not part of main.js):
 *   <script src="https://webflow.teamharvey.co/js/work-wall.js" defer></script>
 *
 * Markup:
 *   [data-wall]                      Section. Optional settings below.
 *     [data-wall-stage]              The hero, styled at its resting height
 *                                    (75svh suits). Stays pinned while the
 *                                    wall scrolls over it.
 *       [data-wall-heading]          Fades out over the hero's height.
 *     [data-wall-grid]               Follows the hero. Style its padding and
 *                                    max width; the script builds columns
 *                                    inside it.
 *       CMS list                     Sorted by Order. Hidden once its tiles
 *                                    are moved into the columns.
 *         [data-wall-tile]           One tile (collection item). Add
 *                                    data-wall-video bound to the Video URL
 *                                    field to play an .mp4 over the image.
 *           img[data-wall-main]      Image, or the video's poster.
 *           [data-wall-client]       Optional client name. Hidden.
 *
 * Settings on [data-wall]:
 *   data-wall-columns-mobile="2"     Columns under the first breakpoint.
 *   data-wall-breakpoints="768:3,1024:4,1280:5,1920:6,2560:7"
 *                                    Columns from each minimum screen width.
 *   data-wall-gap="20"               Gap between tiles in px (12 on mobile).
 *   data-wall-parallax="1"           Motion multiplier, 0 turns it off.
 *
 * With reduced motion the wall is laid out the same but nothing moves, fades
 * or autoplays.
 */
(function () {
  "use strict";

  const debug = window.WebflowFramework?.debug || function () {};

  const TILE_RATIO = "25 / 34"; // width / height
  const DEFAULT_BREAKPOINTS = "768:3,1024:4,1280:5,1920:6,2560:7";
  // Space left under the last tile of each column, as a share of the column
  // width, in a repeating pattern. Columns end at different heights so they
  // drift apart while scrolling.
  const COLUMN_TAILS = [0.1, 0, 0.2, 0.1, 0, 0.1, 0.2, 0.1];
  // How far a column starts from its place, per unit of its distance from
  // the centre of the screen, in column widths
  const SPREAD = 1.5;

  const EASE_OUT = "cubic-bezier(.215,.61,.355,1)"; // power3.out
  const CSS = `
[data-wall]{position:relative;overflow-x:clip}
[data-wall].is-wall-motion [data-wall-stage]{position:sticky;top:0}
[data-wall].is-wall-motion [data-wall-heading]{will-change:opacity}
[data-wall-grid]{position:relative;z-index:1}
[data-wall].is-wall-motion [data-wall-stage],[data-wall].is-wall-motion [data-wall-grid]{opacity:0;transform:translate3d(0,40px,0)}
[data-wall].is-wall-in [data-wall-stage],[data-wall].is-wall-in [data-wall-grid]{opacity:1;transform:none;transition:opacity 1s ${EASE_OUT},transform 1s ${EASE_OUT}}
[data-wall].is-wall-in [data-wall-stage]{transition-delay:.25s}
[data-wall].is-wall-in [data-wall-grid]{transition-delay:.5s}
.wall-columns{display:grid;grid-template-columns:repeat(var(--wall-columns),minmax(0,1fr));gap:var(--wall-gap)}
.wall-column{min-width:0}
.wall-column-inner{display:flex;flex-direction:column;gap:var(--wall-gap)}
[data-wall].is-wall-motion .wall-column,[data-wall].is-wall-motion .wall-column-inner{will-change:transform}
.wall-column-tail{flex:none}
.wall-columns [data-wall-tile]{position:relative;margin:0;overflow:hidden;aspect-ratio:${TILE_RATIO};contain:layout paint}
[data-wall-tile] img,[data-wall-tile] video{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none;-webkit-user-drag:none;user-select:none}
[data-wall-tile] video{position:absolute;inset:0}
[data-wall-tile] [data-wall-client]{display:none!important}
[data-wall].is-wall-motion [data-wall-main]{opacity:0;transition:opacity .4s ease}
[data-wall].is-wall-motion [data-wall-main].is-wall-loaded{opacity:1}`;

  function injectStyles() {
    if (document.getElementById("work-wall-styles")) return;
    const style = document.createElement("style");
    style.id = "work-wall-styles";
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

  function prepareTile(el) {
    const img = el.querySelector("img[data-wall-main]");
    el.querySelectorAll("img").forEach((image) => {
      image.alt = "";
      image.draggable = false;
    });

    const videoUrl = (el.getAttribute("data-wall-video") || "").trim();
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
    if (!img || img.classList.contains("is-wall-loaded")) return;
    const show = () => img.classList.add("is-wall-loaded");
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

  function createWall(section) {
    const stage = section.querySelector("[data-wall-stage]");
    const heading = section.querySelector("[data-wall-heading]");
    const grid = section.querySelector("[data-wall-grid]");
    if (!grid) {
      debug("work-wall", "init", "Missing [data-wall-grid]", "warn");
      return;
    }

    const tiles = Array.from(grid.querySelectorAll("[data-wall-tile]")).map(prepareTile);
    if (!tiles.length) {
      debug("work-wall", "init", "No [data-wall-tile] items found", "warn");
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const settings = {
      columnsMobile: Math.max(1, Math.round(numberAttr(section, "data-wall-columns-mobile", 2))),
      breakpoints: parseBreakpoints(section.getAttribute("data-wall-breakpoints") || DEFAULT_BREAKPOINTS),
      gap: numberAttr(section, "data-wall-gap", null),
      parallax: Math.max(0, numberAttr(section, "data-wall-parallax", 1)),
    };
    const motion = !reducedMotion && settings.parallax > 0;

    // The columns replace the CMS list, which stays in place but empty
    const list = tiles[0].closest(".w-dyn-list") || tiles[0].parentElement;
    const container = document.createElement("div");
    container.className = "wall-columns";
    container.setAttribute("aria-hidden", "true");
    list.parentNode.insertBefore(container, list);
    list.style.display = "none";

    if (motion) section.classList.add("is-wall-motion");

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
    tiles.forEach((tile) => {
      if (videoObserver) tile.querySelectorAll("video").forEach((video) => videoObserver.observe(video));
      if (motion) revealWhenLoaded(tile.querySelector("[data-wall-main]"));
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

    // Deal the tiles out like this.design: even columns first, then odd, so
    // neighbouring tiles in Order land apart
    function build(count) {
      const indices = Array.from({ length: count }, (_, i) => i);
      const order = [...indices.filter((i) => i % 2 === 0), ...indices.filter((i) => i % 2 !== 0)];
      container.textContent = "";
      columns = indices.map((i) => {
        const el = document.createElement("div");
        el.className = "wall-column";
        const inner = document.createElement("div");
        inner.className = "wall-column-inner";
        el.appendChild(inner);
        container.appendChild(el);
        return { el, inner, tailShare: COLUMN_TAILS[i % COLUMN_TAILS.length] };
      });
      tiles.forEach((tile, i) => columns[order[i % count]].inner.appendChild(tile));
      columns.forEach((column) => {
        column.tail = document.createElement("div");
        column.tail.className = "wall-column-tail";
        column.inner.appendChild(column.tail);
        // The first row shows on load
        const first = column.inner.firstElementChild?.querySelector("img");
        if (first) first.loading = "eager";
      });
    }

    function measure() {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      const count = columnCount(viewportWidth);
      if (count !== columns.length) build(count);

      const gap = settings.gap !== null ? settings.gap : count === settings.columnsMobile ? 12 : 20;
      container.style.setProperty("--wall-columns", String(count));
      container.style.setProperty("--wall-gap", `${gap}px`);

      columns.forEach((column) => {
        column.tail.style.height = `${column.el.offsetWidth * column.tailShare}px`;
      });
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
      debug("work-wall", "layout", `${count} columns, ${tiles.length} tiles`, "info");
    }

    // Scroll-linked motion, same curves as this.design's ScrollTrigger setup
    function render() {
      if (!motion) return;
      const sectionTop = section.getBoundingClientRect().top;
      const vw = viewportWidth;
      const vh = viewportHeight;
      const strength = settings.parallax;

      columns.forEach((column) => {
        const top = sectionTop + column.top;

        // From the column's top entering the screen to a screen above it,
        // it eases in from beside its place, further out the further it is
        // from the centre
        const spreadProgress = clamp((vh - top) / (2 * vh), 0, 1);
        const start = ((vw / 2 - column.center) / vw) * column.width * -SPREAD * strength;
        const x = start * (1 - easeOut(spreadProgress));

        // From the column's top reaching halfway up the screen until it has
        // scrolled off, its tiles drift down to the bottom of the column
        const driftProgress = clamp((vh / 2 - top) / (vh / 2 + column.innerHeight), 0, 1);
        const y = (column.height - column.innerHeight) * driftProgress * strength;

        column.el.style.transform = `translate3d(${x}px,0,0)`;
        column.inner.style.transform = `translate3d(0,${y}px,0)`;
      });

      if (heading && stage) {
        const fade = clamp(-sectionTop / stage.offsetHeight, 0, 1);
        heading.style.opacity = String(1 - easeOut(fade));
      }
    }

    if (motion) {
      window.addEventListener("scroll", render, { passive: true });
      // Lenis moves the page inside its own frame loop; follow it there so
      // the wall never trails the page by a frame
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
    // Web fonts can change the hero's height and so where the wall starts
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    window.addEventListener("load", measure, { once: true });

    // Fade in once the first layout has painted
    if (motion) {
      requestAnimationFrame(() => requestAnimationFrame(() => section.classList.add("is-wall-in")));
    }

    debug("work-wall", "init", `Wall ready with ${tiles.length} tiles`, "info");
  }

  function init() {
    try {
      injectStyles();
      document.querySelectorAll("[data-wall]").forEach((section) => {
        try {
          createWall(section);
        } catch (error) {
          console.error("Work wall failed to start:", error);
        }
      });
    } catch (error) {
      console.error("Work wall failed to load:", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
