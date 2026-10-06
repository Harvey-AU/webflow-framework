/**
 * Parallax columns
 *
 * A hero above a grid of items laid out in columns, in the style of
 * this.design. The hero and grid fade up into place on load. Scrolling, the
 * hero stays put while the grid rises over it. Each column starts pushed
 * away from the centre of the screen and eases back in as it rises.
 * Columns start at staggered heights and drift until their bottoms line up
 * at the end of the grid. Items are images or muted looping videos.
 *
 * The layout lives in Webflow: style the CMS list as a CSS grid (columns and
 * gap per breakpoint) and the items with their aspect ratio, so the Designer
 * canvas shows the grid as it ends up. The script never moves the items. It
 * reads which column each item sits in and adds the stagger and motion with
 * transforms.
 *
 * Load standalone on pages that need it (not part of main.js):
 *   <script src="https://webflow.teamharvey.co/js/parallax-columns.js" defer></script>
 *
 * Markup (attribute prefix data-parallax-columns):
 *   [data-parallax-columns]            Section. Optional settings below.
 *     [-hero]                          The hero, styled at its resting height
 *                                      (40svh suits). Stays pinned while the
 *                                      grid scrolls over it. Fade it on
 *                                      scroll with a Webflow interaction.
 *     [-grid]                          Follows the hero. Style its padding
 *                                      and max width.
 *       CMS list                       Styled as a grid, in display order.
 *                                      Items fill it row by row.
 *         [-item]                      One collection item. Style its aspect
 *                                      ratio and overflow. Add -video bound
 *                                      to a video URL field to play an .mp4
 *                                      over the image.
 *           img[-media]                Image, or the video's poster. Style it
 *                                      to cover the item.
 *
 * Settings on [data-parallax-columns]:
 *   -strength="1"                      Motion multiplier, 0 turns it off.
 *
 * With reduced motion the columns keep their stagger but nothing moves,
 * fades or autoplays.
 */
(function () {
  "use strict";

  const debug = window.WebflowFramework?.debug || function () {};

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
[data-parallax-columns].is-parallax-columns-motion [data-parallax-columns-hero]{position:sticky;top:0}
[data-parallax-columns-grid]{position:relative;z-index:1}
[data-parallax-columns].is-parallax-columns-motion [data-parallax-columns-hero],[data-parallax-columns].is-parallax-columns-motion [data-parallax-columns-grid]{opacity:0;transform:translate3d(0,40px,0)}
[data-parallax-columns].is-parallax-columns-in [data-parallax-columns-hero],[data-parallax-columns].is-parallax-columns-in [data-parallax-columns-grid]{opacity:1;transform:none;transition:opacity 1s ${EASE_OUT},transform 1s ${EASE_OUT}}
[data-parallax-columns].is-parallax-columns-in [data-parallax-columns-hero]{transition-delay:.25s}
[data-parallax-columns].is-parallax-columns-in [data-parallax-columns-grid]{transition-delay:.5s}
[data-parallax-columns].is-parallax-columns-motion [data-parallax-columns-item]{will-change:transform}
[data-parallax-columns-item]{position:relative}
[data-parallax-columns-item] img,[data-parallax-columns-item] video{pointer-events:none;-webkit-user-drag:none;user-select:none}
[data-parallax-columns-item] video{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover}
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
    const list = items[0].parentElement;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const settings = {
      strength: Math.max(0, numberAttr(section, "data-parallax-columns-strength", 1)),
    };
    const motion = !reducedMotion && settings.strength > 0;

    if (motion) section.classList.add("is-parallax-columns-motion");

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
    let gridHeight = 0;
    let viewportWidth = 0;
    let viewportHeight = 0;

    // Group the items by the column the CSS grid put them in, left to right
    function readColumns() {
      const byLeft = new Map();
      items.forEach((item) => {
        if (!item.offsetParent) return;
        const left = Math.round(item.offsetLeft);
        if (!byLeft.has(left)) byLeft.set(left, []);
        byLeft.get(left).push(item);
      });
      return Array.from(byLeft.keys())
        .sort((a, b) => a - b)
        .map((left, i) => ({ items: byLeft.get(left), headShare: COLUMN_HEADS[i % COLUMN_HEADS.length] }));
    }

    function measure() {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      list.style.marginBottom = "";
      columns = readColumns();
      if (!columns.length) return;

      const sectionLeft = section.getBoundingClientRect().left;
      const listTop = offsetWithin(list, section, "y");
      columns.forEach((column) => {
        const first = column.items[0];
        const last = column.items[column.items.length - 1];
        column.width = first.offsetWidth;
        column.top = offsetWithin(first, section, "y");
        column.center = sectionLeft + offsetWithin(first, section, "x") + column.width / 2;
        column.head = column.width * column.headShare;
        // Height of the column's items, from its first item's top to its
        // last item's bottom, plus the space above it
        column.contentHeight = column.head + offsetWithin(last, section, "y") + last.offsetHeight - column.top;
        // The first row shows on load
        const img = first.querySelector("img");
        if (img) img.loading = "eager";
        column.items.forEach((item) => {
          item.querySelectorAll("img[srcset]").forEach((image) => {
            image.sizes = `${Math.ceil(column.width)}px`;
          });
        });
      });

      // Columns end with their bottoms lined up at the tallest one. The grid
      // grows by whatever the stagger adds below its own height.
      gridHeight = Math.max(...columns.map((column) => column.contentHeight));
      const extra = columns[0].top + gridHeight - (listTop + list.offsetHeight);
      if (extra > 0) list.style.marginBottom = `${extra}px`;
      render();
      debug("parallax-columns", "layout", `${columns.length} columns, ${items.length} items`, "info");
    }

    function place(column, x, y) {
      const transform = `translate3d(${x}px,${y}px,0)`;
      column.items.forEach((item) => {
        item.style.transform = transform;
      });
    }

    // Scroll-linked motion, same curves as this.design's ScrollTrigger setup
    function render() {
      if (!motion) {
        columns.forEach((column) => place(column, 0, column.head));
        return;
      }
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
        const driftDistance = Math.max(gridHeight - vh / 2, 1);
        const driftProgress = clamp((vh / 2 - top) / driftDistance, 0, 1);
        const y = column.head + (gridHeight - column.contentHeight) * driftProgress * strength;

        place(column, x, y);
      });
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
    const scheduleMeasure = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(measure);
    };
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    window.addEventListener("resize", () => {
      // Ignore height-only changes from mobile browser bars
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === lastWidth && Math.abs(h - lastHeight) < 120) return;
      lastWidth = w;
      lastHeight = h;
      scheduleMeasure();
    });
    // The grid can also change shape without the window resizing, e.g. when
    // the hero above it reflows
    if ("ResizeObserver" in window) {
      let lastListWidth = list.offsetWidth;
      new ResizeObserver(() => {
        if (list.offsetWidth === lastListWidth) return;
        lastListWidth = list.offsetWidth;
        scheduleMeasure();
      }).observe(list);
    }

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
