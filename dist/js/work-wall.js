/**
 * Work wall
 *
 * An endless, drifting masonry wall of images for a hero background.
 * Tiles keep their own aspect ratio, can span one or two columns, drift on
 * their own, can be dragged with a mouse and react to page scroll.
 *
 * Load standalone on pages that need it (not part of main.js):
 *   <script src="https://webflow.teamharvey.co/js/work-wall.js" defer></script>
 *
 * Uses GSAP when present (Webflow site settings > GSAP, no plugins needed)
 * for the intro and ticker, and falls back to requestAnimationFrame.
 *
 * Markup:
 *   [data-wall]                      Section. Optional settings below.
 *     [data-wall-plane]              Layer behind. Holds the CMS list.
 *       [data-wall-tile]             One tile (collection item).
 *         img[data-wall-main]        Main image.
 *         img[data-wall-hover]       Optional image shown on hover.
 *         [data-wall-label]          Optional label shown on hover.
 *           [data-wall-client]       Client name inside the label, used to
 *                                    keep a client's tiles apart.
 *         [data-wall-size]           Text bound to the Size option, or put
 *                                    data-wall-size="2:1" on the tile itself.
 *         [data-wall-pin]            Present (and visible) when the tile is
 *                                    pinned to the first screen, or put
 *                                    data-wall-pin="true" on the tile.
 *     [data-wall-content]            Layer in front. Empty space lets the
 *                                    pointer through to the wall.
 *
 * Settings on [data-wall]:
 *   data-wall-speed="1"              Drift multiplier, 0 stops drift.
 *   data-wall-direction="212"        Drift direction in degrees, clockwise
 *                                    from right (212 = up and to the left).
 *   data-wall-gap="14"               Gap between tiles in px (10 under 640px).
 *   data-wall-columns="5.3"          Columns visible across the section.
 *   data-wall-column-min="170"       Column width limits in px (min 130 under 640px).
 *   data-wall-column-max="300"
 *   data-wall-intro="true"           Pop tiles in on load.
 *   data-wall-seed="harvey"          Changes the shuffled layout.
 */
(function () {
  "use strict";

  const debug = window.WebflowFramework?.debug || function () {};

  // Size option value -> columns spanned and width / height ratio
  const SIZES = {
    "1:1": { span: 1, ratio: 1 },
    "3:4": { span: 1, ratio: 3 / 4 },
    "4:5": { span: 1, ratio: 4 / 5 },
    "2:3": { span: 1, ratio: 2 / 3 },
    "4:3": { span: 1, ratio: 4 / 3 },
    "2:1": { span: 2, ratio: 2 },
    "16:9": { span: 2, ratio: 16 / 9 },
    "1:1 large": { span: 2, ratio: 1 },
  };
  const DEFAULT_SIZE = "1:1";

  // After gaps are filled with whole tiles, a column's recent tiles may be
  // stretched or squashed by this much to keep the wall seamless. Beyond it,
  // a small gap is left instead.
  const MAX_STRETCH = 0.04;
  const DRIFT_PX_PER_SECOND = 25;
  const SCROLL_NUDGE = 0.5;

  const CSS = `
[data-wall]{position:relative;overflow:hidden;isolation:isolate}
[data-wall-plane]{position:absolute;inset:0;z-index:0;overflow:hidden}
[data-wall].is-wall-ready [data-wall-tile]{position:absolute;left:0;top:0;margin:0;overflow:hidden;will-change:transform;contain:layout paint}
[data-wall-tile] img{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none;-webkit-user-drag:none;user-select:none}
[data-wall-tile] [data-wall-hover]{position:absolute;inset:0;opacity:0}
[data-wall-tile] [data-wall-label]{opacity:0}
[data-wall-tile] [data-wall-size],[data-wall-tile] [data-wall-pin]{display:none!important}
[data-wall-content]{position:relative;z-index:1;height:100%;pointer-events:none}
[data-wall-content] > *{pointer-events:auto}
[data-wall].is-wall-draggable{cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}
[data-wall].is-wall-dragging{cursor:grabbing}
@media (hover:hover) and (pointer:fine){
  [data-wall-tile] img{transition:transform .8s cubic-bezier(.16,1,.3,1),opacity .6s ease}
  [data-wall-tile] [data-wall-label]{transition:opacity .3s ease,transform .4s cubic-bezier(.16,1,.3,1);transform:translateY(6px)}
  [data-wall].is-wall-intro [data-wall-tile] img{transition:none}
  [data-wall]:not(.is-wall-dragging):not(.is-wall-intro) [data-wall-tile]:hover [data-wall-main]{transform:scale(1.05)}
  [data-wall]:not(.is-wall-dragging):not(.is-wall-intro) [data-wall-tile].has-wall-hover:hover [data-wall-main]{opacity:0}
  [data-wall]:not(.is-wall-dragging):not(.is-wall-intro) [data-wall-tile]:hover [data-wall-hover]{opacity:1;transform:scale(1.05)}
  [data-wall]:not(.is-wall-dragging):not(.is-wall-intro) [data-wall-tile]:hover [data-wall-label]{opacity:1;transform:none}
}`;

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

  // Webflow marks empty CMS bindings and hidden conditional elements with
  // classes rather than removing them.
  function isPresent(el) {
    return (
      !!el &&
      !el.classList.contains("w-condition-invisible") &&
      !el.classList.contains("w-dyn-bind-empty")
    );
  }

  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function seededRandom(seed) {
    let a = seed;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(list, random) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // Reorder so consecutive tiles come from different clients where possible.
  function spreadClients(list) {
    const pending = list.slice();
    const out = [];
    while (pending.length) {
      const last = out[out.length - 1];
      let index = pending.findIndex((t) => !last || !t.client || t.client !== last.client);
      if (index === -1) index = 0;
      out.push(pending.splice(index, 1)[0]);
    }
    return out;
  }

  function readTile(el, index) {
    const sizeEl = el.querySelector("[data-wall-size]");
    const sizeName = (
      el.getAttribute("data-wall-size") ||
      (isPresent(sizeEl) ? sizeEl.textContent : "") ||
      DEFAULT_SIZE
    ).trim();
    const size = SIZES[sizeName] || SIZES[DEFAULT_SIZE];
    if (!SIZES[sizeName]) debug("work-wall", "size", `Unknown size "${sizeName}", using ${DEFAULT_SIZE}`, "warn");

    const pinEl = el.querySelector("[data-wall-pin]");
    const pinAttr = el.getAttribute("data-wall-pin");
    const pinned = pinAttr !== null ? pinAttr !== "false" : isPresent(pinEl);

    const hoverImg = el.querySelector("img[data-wall-hover]");
    if (isPresent(hoverImg) && hoverImg.getAttribute("src")) {
      el.classList.add("has-wall-hover");
    } else if (hoverImg) {
      hoverImg.remove();
    }

    const clientEl = el.querySelector("[data-wall-client]") || el.querySelector("[data-wall-label]");
    const client = (el.getAttribute("data-wall-client") || (clientEl ? clientEl.textContent : "")).trim();

    el.querySelectorAll("img").forEach((img) => {
      img.alt = "";
      img.draggable = false;
    });

    return { el, index, span: size.span, ratio: size.ratio, pinned, client };
  }

  function createWall(section) {
    const plane = section.querySelector("[data-wall-plane]");
    if (!plane) {
      debug("work-wall", "init", "Missing [data-wall-plane]", "warn");
      return;
    }

    const sources = Array.from(plane.querySelectorAll("[data-wall-tile]")).map(readTile);
    if (!sources.length) {
      debug("work-wall", "init", "No [data-wall-tile] items found", "warn");
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
    const gsap = window.gsap;

    const settings = {
      speed: numberAttr(section, "data-wall-speed", 1),
      direction: numberAttr(section, "data-wall-direction", 212),
      gap: section.hasAttribute("data-wall-gap") ? numberAttr(section, "data-wall-gap", 14) : null,
      columns: numberAttr(section, "data-wall-columns", 5.3),
      columnMin: numberAttr(section, "data-wall-column-min", null),
      columnMax: numberAttr(section, "data-wall-column-max", 300),
      intro: section.getAttribute("data-wall-intro") !== "false",
      seed: section.getAttribute("data-wall-seed") || "harvey",
    };

    // Pinned tiles first so they land on the first screen, the rest shuffled
    // the same way on every load.
    const random = seededRandom(hashString(settings.seed + sources.length));
    const pinned = sources.filter((t) => t.pinned);
    const rest = spreadClients(shuffle(sources.filter((t) => !t.pinned), random));
    const sequence = pinned.concat(rest);

    plane.setAttribute("aria-hidden", "true");
    section.classList.add("is-wall-ready");

    let tiles = [];
    let clones = [];
    let columnWidth = 0;
    let gap = 14;
    let planeWidth = 0;
    let planeHeight = 0;
    let offsetX = 0;
    let offsetY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let dragging = false;
    let visible = true;
    let started = false;

    function layout() {
      const vw = section.clientWidth;
      const vh = section.clientHeight;
      if (!vw || !vh) return;

      gap = settings.gap !== null ? settings.gap : vw < 640 ? 10 : 14;
      const columnMin = settings.columnMin !== null ? settings.columnMin : vw < 640 ? 130 : 170;
      columnWidth = Math.max(columnMin, Math.min(settings.columnMax, vw / settings.columns));
      const step = columnWidth + gap;

      // Wide enough that a two-column tile is never on screen twice
      const columnCount = Math.max(3, Math.ceil((vw + 2 * columnWidth + gap) / step) + 1);
      planeWidth = columnCount * step;

      const tallest = Math.max(...sequence.map((t) => (columnWidth * t.span + gap * (t.span - 1)) / t.ratio));
      const minHeight = vh + tallest + gap;

      // Pack with the shortest column first. Repeat the sequence (as clones)
      // until every tile has been used and every column reaches minHeight.
      const heights = new Array(columnCount).fill(0);
      const columns = Array.from({ length: columnCount }, () => []);
      const placed = [];
      let i = 0;

      const singles = sources.filter((t) => t.span === 1);
      const uses = new Map();

      function heightOf(source) {
        return (columnWidth * source.span + gap * (source.span - 1)) / source.ratio;
      }

      function place(source, forcedColumn) {
        const width = columnWidth * source.span + gap * (source.span - 1);
        const height = width / source.ratio;
        let column = forcedColumn;
        let y;

        if (source.span === 1) {
          if (column === undefined) column = heights.indexOf(Math.min(...heights));
          y = heights[column];
        } else {
          // Two columns side by side (never wrapping past the last column),
          // choosing the pair with the smallest step between them.
          let best = null;
          for (let c = 0; c < columnCount - 1; c++) {
            const top = Math.max(heights[c], heights[c + 1]);
            const step = Math.abs(heights[c] - heights[c + 1]);
            const score = top + step * 2;
            if (!best || score < best.score) best = { c, top, score };
          }
          column = best.c;
          y = best.top;
          // Level the two columns before the wide tile sits across them
          fillColumn(column, y);
          fillColumn(column + 1, y);
          y = Math.max(heights[column], heights[column + 1]);
        }

        const tile = { source, column, span: source.span, width, height, y };
        for (let s = 0; s < source.span; s++) {
          columns[column + s].push(tile);
          heights[column + s] = y + height + gap;
        }
        uses.set(source, (uses.get(source) || 0) + 1);
        placed.push(tile);
      }

      // Bring a column down to targetY: first add the best-fitting
      // one-column tiles (repeats), then stretch or squash the column's
      // recent tiles for whatever is left, within MAX_STRETCH.
      function fillColumn(c, targetY) {
        for (;;) {
          const remaining = targetY - heights[c];
          const last = columns[c][columns[c].length - 1];
          const fits = singles.filter((t) => heightOf(t) + gap <= remaining * (1 + MAX_STRETCH));
          if (!fits.length) break;
          // Tallest fit first; among near ties, the least used, then a
          // different client from the tile above.
          const tallest = Math.max(...fits.map(heightOf));
          const pick = fits
            .filter((t) => heightOf(t) >= tallest * 0.9)
            .sort(
              (a, b) =>
                (uses.get(a) || 0) - (uses.get(b) || 0) ||
                (last && a.client === last.source.client) - (last && b.client === last.source.client)
            )[0];
          place(pick, c);
        }
        closeColumn(c, targetY);
      }

      function closeColumn(c, targetY) {
        const missing = targetY - heights[c];
        if (Math.abs(missing) <= 0.5) return;
        const free = [];
        for (let k = columns[c].length - 1; k >= 0 && columns[c][k].span === 1; k--) free.unshift(columns[c][k]);
        const freeHeight = free.reduce((sum, t) => sum + t.height, 0);
        if (!freeHeight) return;
        const limit = freeHeight * MAX_STRETCH;
        const change = Math.max(-limit, Math.min(limit, missing));
        let y = free[0].y;
        free.forEach((t) => {
          t.height += change * (t.height / freeHeight);
          t.y = y;
          y += t.height + gap;
        });
        heights[c] = y;
      }

      while (i < sequence.length || Math.min(...heights) < minHeight) {
        place(sequence[i % sequence.length]);
        i++;
      }

      planeHeight = Math.max(...heights);
      for (let c = 0; c < columnCount; c++) fillColumn(c, planeHeight);

      // Reuse existing elements, cloning only where the sequence repeats
      clones.forEach((el) => el.remove());
      clones = [];
      const used = new Set();
      tiles = placed.map((tile) => {
        let el = tile.source.el;
        if (used.has(el)) {
          el = el.cloneNode(true);
          tile.source.el.parentNode.appendChild(el);
          clones.push(el);
        }
        used.add(tile.source.el);
        tile.el = el;
        tile.baseX = tile.column * step;
        el.style.width = `${tile.width}px`;
        el.style.height = `${tile.height}px`;
        el.querySelectorAll("img").forEach((img) => {
          if (img.hasAttribute("srcset")) img.sizes = `${Math.ceil(tile.width)}px`;
        });
        return tile;
      });

      // Pinned tiles are in the top rows. Start with the first column
      // slightly in from the left edge.
      if (!started) {
        offsetX = columnWidth * 0.3;
        offsetY = gap;
        started = true;
      }

      // Eager-load what is on the first screen
      tiles.forEach((tile) => {
        const img = tile.el.querySelector("[data-wall-main]");
        if (img && tile.y < vh && tile.baseX < vw) img.loading = "eager";
      });

      render();
      debug("work-wall", "layout", `${columnCount} columns, ${tiles.length} tiles (${clones.length} repeats)`, "info");
    }

    function wrap(value, size) {
      return ((value % size) + size) % size;
    }

    function render() {
      for (let k = 0; k < tiles.length; k++) {
        const t = tiles[k];
        const x = wrap(t.baseX + offsetX + t.width, planeWidth) - t.width;
        const y = wrap(t.y + offsetY + t.height, planeHeight) - t.height;
        t.el.style.transform = `translate3d(${x}px,${y}px,0)`;
      }
    }

    const angle = (settings.direction * Math.PI) / 180;
    const driftSpeed = reducedMotion ? 0 : DRIFT_PX_PER_SECOND * settings.speed;
    const driftX = Math.cos(angle) * driftSpeed;
    const driftY = Math.sin(angle) * driftSpeed;

    function tick(dt) {
      if (!visible || !tiles.length) return;
      if (!dragging) {
        if (Math.abs(velocityX) > 0.05 || Math.abs(velocityY) > 0.05) {
          const decay = Math.pow(0.94, dt * 60);
          offsetX += velocityX * dt * 60;
          offsetY += velocityY * dt * 60;
          velocityX *= decay;
          velocityY *= decay;
        } else {
          velocityX = velocityY = 0;
          offsetX += driftX * dt;
          offsetY += driftY * dt;
        }
      }
      render();
    }

    if (gsap) {
      gsap.ticker.add((time, deltaTime) => tick(Math.min(deltaTime, 100) / 1000));
    } else {
      let last = performance.now();
      const frame = (now) => {
        tick(Math.min(now - last, 100) / 1000);
        last = now;
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }

    // Drag (mouse and trackpad only, so touch keeps scrolling the page)
    if (finePointer) {
      section.classList.add("is-wall-draggable");
      let lastX = 0;
      let lastY = 0;

      section.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        const content = e.target.closest("[data-wall-content] > *");
        if (content) return;
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        velocityX = velocityY = 0;
        section.classList.add("is-wall-dragging");
        section.setPointerCapture(e.pointerId);
      });

      section.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        offsetX += dx;
        offsetY += dy;
        velocityX = dx;
        velocityY = dy;
      });

      const endDrag = () => {
        if (!dragging) return;
        dragging = false;
        section.classList.remove("is-wall-dragging");
      };
      section.addEventListener("pointerup", endDrag);
      section.addEventListener("pointercancel", endDrag);
      section.addEventListener("lostpointercapture", endDrag);
    }

    // Page scroll nudges the wall
    let lastScroll = window.scrollY;
    window.addEventListener(
      "scroll",
      () => {
        const delta = window.scrollY - lastScroll;
        lastScroll = window.scrollY;
        if (!dragging && visible && !reducedMotion) offsetY -= delta * SCROLL_NUDGE;
      },
      { passive: true }
    );

    // Pause while off screen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
      }).observe(section);
    }

    let resizeFrame = null;
    let lastWidth = section.clientWidth;
    let lastHeight = section.clientHeight;
    new ResizeObserver(() => {
      // Ignore height-only changes from mobile browser bars
      const w = section.clientWidth;
      const h = section.clientHeight;
      if (w === lastWidth && Math.abs(h - lastHeight) < 120) return;
      lastWidth = w;
      lastHeight = h;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(layout);
    }).observe(section);

    layout();

    // Intro
    if (gsap && settings.intro && !reducedMotion) {
      section.classList.add("is-wall-intro");
      const images = tiles.map((t) => t.el.querySelector("[data-wall-main]")).filter(Boolean);
      gsap.from(images, {
        scale: 1.3,
        opacity: 0,
        duration: 1.4,
        ease: "expo.out",
        stagger: { each: 0.012, from: "random" },
        clearProps: "transform,opacity",
        onComplete: () => section.classList.remove("is-wall-intro"),
      });
    }

    debug("work-wall", "init", `Wall ready with ${sources.length} tiles`, "info");
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
