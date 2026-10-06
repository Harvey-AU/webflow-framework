/**
 * Work wall
 *
 * A hero of client work. A fixed set of columns, one client each, sits in a
 * container under the heading. Scrolling pins the hero: the wall rises over
 * the heading and grows to full bleed, holds, then shrinks back into a
 * container before the page scrolls on. While pinned, each column moves at
 * its own rate and settles with its own lag, and moving the mouse left or
 * right pans the wall to reveal the cropped edge columns. Tiles are images or
 * muted looping videos. Nothing moves until the page is scrolled or the mouse
 * is moved.
 *
 * Load standalone on pages that need it (not part of main.js):
 *   <script src="https://webflow.teamharvey.co/js/work-wall.js" defer></script>
 *
 * Uses GSAP's ticker when present (Webflow site settings > GSAP, no plugins
 * needed) and falls back to requestAnimationFrame.
 *
 * Markup:
 *   [data-wall]                      Section. Optional settings below.
 *     [data-wall-stage]              Fills the screen. Style it as the
 *                                    resting layout: heading, then frame.
 *       [data-wall-heading]          Stays in place and fades back as the
 *                                    wall rises over it.
 *       [data-wall-frame]            The container. Its styled size and
 *                                    position are where the wall starts and
 *                                    ends; it grows to the screen between.
 *         [data-wall-plane]          Holds the CMS list, sorted by Order.
 *           [data-wall-tile]         One tile (collection item). Add
 *                                    data-wall-video bound to the Video URL
 *                                    field to play an .mp4 over the image.
 *             img[data-wall-main]    Image, or the video's poster.
 *             [data-wall-client]     Text bound to the client name. Tiles
 *                                    with the same client share a column.
 *                                    Hidden by this script.
 *
 * Settings on [data-wall]:
 *   data-wall-columns="7"            Columns on desktop. The first clients
 *                                    in Order fill them, left to right.
 *   data-wall-columns-mobile="2"     Columns under 768px, sized to fill the
 *                                    frame.
 *   data-wall-tile-width="160"       Minimum tile width in px on desktop.
 *   data-wall-gap="20"               Gap between tiles in px (12 on mobile).
 *   data-wall-scroll="250"           Pinned scroll length, in % of the
 *                                    screen height.
 *   data-wall-parallax="1"           Column parallax multiplier (halved on
 *                                    mobile), 0 turns it off.
 *
 * With reduced motion the hero stays in its resting layout: no pin,
 * parallax, pan or video autoplay.
 */
(function () {
  "use strict";

  const debug = window.WebflowFramework?.debug || function () {};

  const TILE_RATIO = 25 / 34; // width / height
  // Columns step down by a third of a tile in a repeating pattern of three
  const STAGGER_STEPS = 3;
  // The wall is this much wider than the screen on desktop, so the edge
  // columns stay cropped until the mouse pans to them
  const DESKTOP_OVERFLOW = 1.12;
  const MOBILE_BREAKPOINT = 768;
  // Scroll phases, as fractions of the pinned scroll: grow, hold, shrink
  const GROW_END = 0.4;
  const SHRINK_START = 0.6;
  const HEADING_FADED_OPACITY = 0.15;
  // Per column: share of the scroll it moves by, and how long it takes to
  // catch up (seconds). Neighbours differ so the columns drift apart.
  const COLUMN_SPEEDS = [0.15, 0.35, 0.25, 0.45, 0.2, 0.4, 0.3];
  const COLUMN_LAGS = [0.5, 0.8, 0.2, 0.3, 0.6, 0.4, 0.7];
  // Share of the remaining pan distance covered per 60fps frame
  const PAN_EASE = 0.05;

  const CSS = `
[data-wall].is-wall-pinned{position:relative;overflow:visible}
[data-wall].is-wall-pinned [data-wall-stage]{position:sticky;top:0;height:100svh;overflow:clip}
[data-wall].is-wall-pinned [data-wall-frame]{position:absolute!important;inset:0!important;width:auto!important;height:auto!important;aspect-ratio:auto!important;margin:0!important;max-width:none!important;min-height:0!important;max-height:none!important;will-change:clip-path}
[data-wall].is-wall-pinned [data-wall-heading]{will-change:opacity}
[data-wall-frame]{position:relative;overflow:hidden}
[data-wall].is-wall-ready [data-wall-plane]{position:absolute;inset:0;overflow:visible}
[data-wall].is-wall-ready [data-wall-tile]{position:absolute;left:0;top:0;margin:0;overflow:hidden;will-change:transform;contain:layout paint}
[data-wall-tile] img,[data-wall-tile] video{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none;-webkit-user-drag:none;user-select:none}
[data-wall-tile] video{position:absolute;inset:0}
[data-wall-tile] [data-wall-client]{display:none!important}
[data-wall].is-wall-fade [data-wall-main]{opacity:0;transition:opacity .4s ease}
[data-wall].is-wall-fade [data-wall-main].is-wall-loaded{opacity:1}`;

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

  function lerp(from, to, amount) {
    return from + (to - from) * amount;
  }

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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

  function createWall(section) {
    const stage = section.querySelector("[data-wall-stage]");
    const frame = section.querySelector("[data-wall-frame]");
    const plane = section.querySelector("[data-wall-plane]");
    const heading = section.querySelector("[data-wall-heading]");
    if (!stage || !frame || !plane) {
      debug("work-wall", "init", "Missing [data-wall-stage], [data-wall-frame] or [data-wall-plane]", "warn");
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
      columns: Math.max(1, Math.round(numberAttr(section, "data-wall-columns", 7))),
      columnsMobile: Math.max(1, Math.round(numberAttr(section, "data-wall-columns-mobile", 2))),
      tileWidth: numberAttr(section, "data-wall-tile-width", 160),
      gap: numberAttr(section, "data-wall-gap", null),
      scroll: Math.max(0, numberAttr(section, "data-wall-scroll", 250)),
      parallax: numberAttr(section, "data-wall-parallax", 1),
    };

    plane.setAttribute("aria-hidden", "true");
    section.classList.add("is-wall-ready");
    if (!reducedMotion) section.classList.add("is-wall-fade");

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
    let columns = [];
    let wallWidth = 0;
    let mobile = false;
    let visible = true;

    // Frame insets from the stage edges at rest, and its corner radius
    const rest = { top: 0, right: 0, bottom: 0, left: 0, radius: 0 };
    let pinLength = 0;
    let scrolled = 0;
    let insetX = 0;
    let planeY = 0;

    let panning = false;
    let pointerRatio = 0.5;
    let panTarget = 0;
    let panX = 0;

    // Measure the frame where the page styles put it, then take it over
    function measureRest() {
      section.classList.remove("is-wall-pinned");
      section.style.height = "";
      const stageRect = stage.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      rest.top = frameRect.top - stageRect.top;
      rest.left = frameRect.left - stageRect.left;
      rest.right = stageRect.right - frameRect.right;
      rest.bottom = Math.max(0, stageRect.bottom - frameRect.bottom);
      rest.radius = parseFloat(getComputedStyle(frame).borderTopLeftRadius) || 0;
      rest.width = frameRect.width;
    }

    function pin() {
      const vh = window.innerHeight;
      pinLength = (vh * settings.scroll) / 100;
      section.classList.add("is-wall-pinned");
      section.style.height = `${stage.offsetHeight + pinLength}px`;
    }

    function layout() {
      if (reducedMotion) {
        section.classList.remove("is-wall-pinned");
      } else {
        measureRest();
      }

      const vw = stage.clientWidth;
      const vh = stage.clientHeight;
      if (!vw || !vh) return;

      mobile = vw < MOBILE_BREAKPOINT;
      const count = mobile ? settings.columnsMobile : settings.columns;
      const gap = settings.gap !== null ? settings.gap : mobile ? 12 : 20;
      const frameWidth = reducedMotion ? frame.clientWidth : rest.width;
      // Mobile columns fill the frame. Desktop columns scale with the screen
      // and overflow it, so the edge columns peek in at every width (250px
      // tiles on a 1680px screen, as designed).
      const width = mobile
        ? (frameWidth - (count - 1) * gap) / count
        : Math.max(settings.tileWidth, (vw * DESKTOP_OVERFLOW - (count - 1) * gap) / count);
      const height = width / TILE_RATIO;
      const stepX = width + gap;
      const stepY = height + gap;
      wallWidth = count * width + (count - 1) * gap;

      // Each column loops on its own: the client's tiles, repeated until
      // the loop is taller than the screen plus one tile. The wall starts
      // part way up so the columns enter staggered from the top.
      const startY = -stepY * (5 / 9);
      const placed = [];
      const nextColumns = [];
      for (let c = 0; c < count; c++) {
        const group = clients[c % clients.length];
        const rows = Math.max(group.length, Math.ceil((vh + stepY) / stepY) + 1);
        const loopHeight = rows * stepY;
        const stagger = ((c % STAGGER_STEPS) * stepY) / STAGGER_STEPS;
        const previous = columns[c];
        nextColumns.push({
          speed: COLUMN_SPEEDS[c % COLUMN_SPEEDS.length],
          lag: COLUMN_LAGS[c % COLUMN_LAGS.length],
          offset: previous ? previous.offset : 0,
        });
        for (let k = 0; k < rows; k++) {
          placed.push({
            source: group[k % group.length],
            column: c,
            baseX: c * stepX,
            baseY: startY + k * stepY + stagger,
            loopHeight,
          });
        }
      }
      columns = nextColumns;

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
          el.querySelectorAll(".is-wall-loaded").forEach((img) => img.classList.remove("is-wall-loaded"));
          tile.source.el.parentNode.appendChild(el);
          clones.push(el);
        }
        used.add(tile.source.el);
        tile.el = el;
        tile.width = width;
        tile.height = height;
        el.style.display = "";
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
      // Clients past the column count are not shown
      sources.forEach((source) => {
        if (!used.has(source.el)) source.el.style.display = "none";
      });

      // Eager-load what is on the first screen, fade everything in
      tiles.forEach((tile) => {
        const img = tile.el.querySelector("[data-wall-main]");
        if (!img) return;
        if (tile.baseY < vh) img.loading = "eager";
        if (!reducedMotion) revealWhenLoaded(img);
      });

      if (!reducedMotion) pin();
      update(0, true);
      debug("work-wall", "layout", `${count} columns, ${tiles.length} tiles (${clones.length} repeats)`, "info");
    }

    function wrap(value, size) {
      return ((value % size) + size) % size;
    }

    // Read the scroll position and work out the frame for this moment
    function updateFrame() {
      scrolled = clamp(-section.getBoundingClientRect().top, 0, pinLength);
      const progress = pinLength ? scrolled / pinLength : 0;

      let grow;
      if (progress < GROW_END) grow = easeInOut(progress / GROW_END);
      else if (progress <= SHRINK_START) grow = 1;
      else grow = easeInOut(1 - (progress - SHRINK_START) / (1 - SHRINK_START));

      // Growing, the frame rises from its resting place to the top. Shrinking,
      // it stays at the top and closes in by its side margin all round.
      const rising = progress < GROW_END;
      const settle = rest.left;
      const top = rising ? lerp(rest.top, 0, grow) : lerp(settle, 0, grow);
      const bottom = rising ? lerp(rest.bottom, 0, grow) : lerp(settle, 0, grow);
      insetX = lerp(rest.left, 0, grow);
      const radius = lerp(rest.radius, 0, grow);
      frame.style.clipPath = `inset(${top}px ${insetX}px ${bottom}px ${insetX}px round ${radius}px)`;

      // The tiles ride up with the frame while it rises, then stay put
      planeY = rising ? top : 0;

      if (heading) {
        const fade = clamp(progress / GROW_END, 0, 1);
        heading.style.opacity = String(lerp(1, HEADING_FADED_OPACITY, fade));
      }
    }

    function render() {
      const vw = stage.clientWidth;
      const left = (vw - wallWidth) / 2 + panX;
      for (let k = 0; k < tiles.length; k++) {
        const t = tiles[k];
        const x = left + t.baseX;
        const y = wrap(t.baseY + columns[t.column].offset + planeY + t.height, t.loopHeight) - t.height;
        t.el.style.transform = `translate3d(${x}px,${y}px,0)`;
      }
    }

    function update(dt, snap) {
      if (!tiles.length) return;
      if (!reducedMotion) {
        updateFrame();

        const strength = settings.parallax * (mobile ? 0.5 : 1);
        for (let c = 0; c < columns.length; c++) {
          const column = columns[c];
          const target = -scrolled * column.speed * strength;
          column.offset = snap ? target : lerp(column.offset, target, 1 - Math.exp((-dt * 3) / column.lag));
        }

        // Pan reveals the cropped edges of whatever the frame shows now
        const shown = stage.clientWidth - insetX * 2;
        const maxPan = Math.max(0, (wallWidth - shown) / 2);
        panTarget = panning ? (0.5 - pointerRatio) * 2 * maxPan : 0;
        panX = snap ? panTarget : lerp(panX, panTarget, 1 - Math.pow(1 - PAN_EASE, dt * 60));
        panX = clamp(panX, -maxPan, maxPan);
      }
      render();
    }

    function tick(dt) {
      if (visible) update(dt, false);
    }

    if (!reducedMotion) {
      if (gsap) {
        gsap.ticker.add((time, deltaTime) => tick(Math.min(deltaTime, 100) / 1000));
      } else {
        let last = performance.now();
        const frameLoop = (now) => {
          tick(Math.min(now - last, 100) / 1000);
          last = now;
          requestAnimationFrame(frameLoop);
        };
        requestAnimationFrame(frameLoop);
      }
    }

    // Mouse position across the hero pans the wall (desktop mice only)
    if (finePointer && !reducedMotion) {
      section.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse" || mobile) return;
        panning = true;
        pointerRatio = clamp(e.clientX / window.innerWidth, 0, 1);
      });
      section.addEventListener("pointerleave", () => {
        panning = false;
      });
    }

    // Pause while off screen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
      }).observe(section);
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
      resizeFrame = requestAnimationFrame(layout);
    });

    layout();
    // Web fonts can move the heading and so the frame's resting place
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

    debug("work-wall", "init", `Wall ready with ${sources.length} tiles from ${clients.length} clients`, "info");
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
