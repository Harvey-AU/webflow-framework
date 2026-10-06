/**
 * Work wall
 *
 * An endless, drifting wall of client work for a hero background. Each
 * column belongs to one client and stacks that client's tiles. Tiles share
 * one size (25:34), columns are staggered in a repeating pattern of three,
 * and the wall drifts on its own, can be dragged with a mouse and reacts to
 * page scroll. Tiles can be images or muted looping videos.
 *
 * Load standalone on pages that need it (not part of main.js):
 *   <script src="https://webflow.teamharvey.co/js/work-wall.js" defer></script>
 *
 * Uses GSAP when present (Webflow site settings > GSAP, no plugins needed)
 * for the intro and ticker, and falls back to requestAnimationFrame.
 *
 * Markup:
 *   [data-wall]                      Section. Optional settings below.
 *     [data-wall-plane]              Layer behind. Holds the CMS list,
 *                                    sorted by Order.
 *       [data-wall-tile]             One tile (collection item). Add
 *                                    data-wall-video bound to the Video URL
 *                                    field to play an .mp4 over the image.
 *         img[data-wall-main]        Image, or the video's poster.
 *         [data-wall-client]         Text bound to the client name. Tiles
 *                                    with the same client share a column.
 *                                    Hidden by this script.
 *     [data-wall-content]            Layer in front. Empty space lets the
 *                                    pointer through to the wall.
 *
 * Settings on [data-wall]:
 *   data-wall-speed="1"              Drift multiplier, 0 stops drift.
 *   data-wall-direction="212"        Drift direction in degrees, clockwise
 *                                    from right (212 = up and to the left).
 *   data-wall-tile-width="250"       Tile width in px (150 under 640px).
 *   data-wall-gap="20"               Gap between tiles in px (12 under 640px).
 *   data-wall-intro="true"           Pop tiles in on load.
 */
(function () {
  "use strict";

  const debug = window.WebflowFramework?.debug || function () {};

  const TILE_RATIO = 25 / 34; // width / height
  // Columns step down by a third of a tile in a repeating pattern of three
  const STAGGER_STEPS = 3;
  const DRIFT_PX_PER_SECOND = 25;
  const SCROLL_NUDGE = 0.5;

  const CSS = `
[data-wall]{position:relative;overflow:hidden;isolation:isolate}
[data-wall-plane]{position:absolute;inset:0;z-index:0;overflow:hidden}
[data-wall].is-wall-ready [data-wall-tile]{position:absolute;left:0;top:0;margin:0;overflow:hidden;will-change:transform;contain:layout paint}
[data-wall-tile] img,[data-wall-tile] video{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none;-webkit-user-drag:none;user-select:none}
[data-wall-tile] video{position:absolute;inset:0}
[data-wall-tile] [data-wall-client]{display:none!important}
[data-wall-content]{position:relative;z-index:1;height:100%;pointer-events:none}
[data-wall-content] > *{pointer-events:auto}
[data-wall].is-wall-draggable{cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}
[data-wall].is-wall-dragging{cursor:grabbing}`;

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

  function readTile(el, index) {
    const clientEl = el.querySelector("[data-wall-client]");
    const client = (
      el.getAttribute("data-wall-client") ||
      (isPresent(clientEl) ? clientEl.textContent : "") ||
      `tile-${index}`
    ).trim();

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

    return { el, client };
  }

  // Group tiles into one column per client, in order of first appearance
  function groupByClient(tiles) {
    const groups = new Map();
    tiles.forEach((tile) => {
      if (!groups.has(tile.client)) groups.set(tile.client, []);
      groups.get(tile.client).push(tile);
    });
    return Array.from(groups.values());
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
    const clients = groupByClient(sources);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
    const gsap = window.gsap;

    const settings = {
      speed: numberAttr(section, "data-wall-speed", 1),
      direction: numberAttr(section, "data-wall-direction", 212),
      tileWidth: numberAttr(section, "data-wall-tile-width", null),
      gap: numberAttr(section, "data-wall-gap", null),
      intro: section.getAttribute("data-wall-intro") !== "false",
    };

    plane.setAttribute("aria-hidden", "true");
    section.classList.add("is-wall-ready");

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

    let tiles = [];
    let clones = [];
    let planeWidth = 0;
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

      const small = vw < 640;
      const width = settings.tileWidth !== null ? settings.tileWidth : small ? 150 : 250;
      const gap = settings.gap !== null ? settings.gap : small ? 12 : 20;
      const height = width / TILE_RATIO;
      const stepX = width + gap;
      const stepY = height + gap;

      // Enough columns to cover the screen with one to spare, in whole
      // stagger patterns so the pattern carries across the wrap. Use every
      // client at least once, repeating clients when there are too few,
      // without the same client either side of the wrap.
      const needed = Math.max(clients.length, Math.ceil((vw + width + gap) / stepX) + 1);
      let columnCount = Math.ceil(needed / STAGGER_STEPS) * STAGGER_STEPS;
      while (clients.length > 1 && (columnCount - 1) % clients.length === 0) columnCount += STAGGER_STEPS;
      planeWidth = columnCount * stepX;

      // Each column loops on its own: the client's tiles, repeated until
      // the loop is taller than the screen plus one tile.
      const placed = [];
      for (let c = 0; c < columnCount; c++) {
        const group = clients[c % clients.length];
        const count = Math.max(group.length, Math.ceil((vh + stepY) / stepY) + 1);
        const loopHeight = count * stepY;
        const stagger = ((c % STAGGER_STEPS) * stepY) / STAGGER_STEPS;
        for (let k = 0; k < count; k++) {
          placed.push({
            source: group[k % group.length],
            baseX: c * stepX,
            baseY: k * stepY + stagger,
            loopHeight,
          });
        }
      }

      // Reuse existing elements, cloning only where tiles repeat
      clones.forEach((el) => {
        el.querySelectorAll("video").forEach((video) => videoObserver && videoObserver.unobserve(video));
        el.remove();
      });
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
        tile.width = width;
        tile.height = height;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        el.querySelectorAll("img").forEach((img) => {
          if (img.hasAttribute("srcset")) img.sizes = `${Math.ceil(width)}px`;
        });
        el.querySelectorAll("video").forEach((video) => {
          // Cloning does not carry the muted property, which autoplay needs
          video.muted = true;
          if (videoObserver) videoObserver.observe(video);
        });
        return tile;
      });

      // Start with the first column part way off the left edge
      if (!started) {
        offsetX = -width * 0.4;
        offsetY = -height * 0.2;
        started = true;
      }

      // Eager-load what is on the first screen
      tiles.forEach((tile) => {
        const img = tile.el.querySelector("[data-wall-main]");
        if (img && tile.baseY < vh && tile.baseX < vw) img.loading = "eager";
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
        const y = wrap(t.baseY + offsetY + t.height, t.loopHeight) - t.height;
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
      const media = [];
      tiles.forEach((t) => {
        t.el.querySelectorAll("[data-wall-main], video").forEach((el) => media.push(el));
      });
      gsap.from(media, {
        scale: 1.3,
        opacity: 0,
        duration: 1.4,
        ease: "expo.out",
        stagger: { each: 0.012, from: "random" },
        clearProps: "transform,opacity",
      });
    }

    debug("work-wall", "init", `Wall ready with ${sources.length} tiles in ${clients.length} columns`, "info");
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
