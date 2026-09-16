# v1 framework CSS → v3 — what migrates, what dies
From reading `src/css/core/base.css`, `src/css/icons/base.css`, `src/css/core/grid.css` in the CDN repo (2026-09-11). Most of it dies.

**Governing rule (user-set, 2026-09-11): existence in v1 is NOT a reason to port. Default is drop; a feature migrates only when a migrating design needs it, after checking real usage.** Every exposed option is forever.

## Baseline — ships with the component (correctness, not features)
- **RichText first/last margin trim** (base.css 21–32) → RichText's style block.
- **`:focus-visible` ring** (base.css 9–14): page CSS can't reach into shadow roots — Button etc. must carry their own or keyboard focus silently breaks.
- **Icon = inline SVG** replacing the mask-image pseudo-element machinery (icons/base.css entirely + ~97KB of masks in main.css). Keep glyph NAMES as the API. USER RULING 2026-09-13: ship ALL ~60 glyphs as v1 (overrides the earlier extract-only-used lean). Decoration likewise ships the full v1 set (underline-1/2/3 + strike-through).

## Port only on demand — audit usage first, then build when a migrating design needs it
- Decoration underlines (base.css 443–491): custom `::after` bars, `--_font---underline--N-size/-gap`; port only the variants designs actually use. `button-hover-underline` likewise (cheap, fits the custom-property mechanism).
- `grid-boxed` (grid.css 1–131): boxed grid with shared cell borders — elaborate enough to be one site's design. If usage is 1–2 sites it is NOT library material; build with that site's migration, ~15 static lines.
- Card `vertical-space-between` distribution · line-clamp (`text-style-2/3lines`) · breakpoint element/image swap · rich-text `hr` styling and in-richtext button margins.
- **Per-breakpoint reverse** (`reverse---tablet-lower` etc.): stronger candidate than the rest — it is v1 PRODUCTION CSS solving the stacking-order problem (which element comes first when a grid stacks). v1's explicit control and v2's implicit un-reverse-when-stacked are competing answers; only v1's ever faced real content. Lean toward the v1 shape for Grid's Direction options, subject to the usage audit.

**Evidence hierarchy for all on-demand calls: v1 production usage > v1 CSS existence > v2's choices. v2 NEVER REACHED PRODUCTION — its scoping decisions are untested bets, never usage evidence.** Usage audits are concrete: the features ride on named `u_*` utility components — `query_components` with `includeInstanceCount` per site, or grep published HTML for `data-wf--u_*` attributes.

## Dead, confirmed — never port
- Gutter overrides (v1-parity already ruled them deliberately dropped).
- `.w-embed:has(.riaa-table) + a.button` — a single client's hack inside the shared framework. Site-specific fixes live in site code, never the library. Treat any selector naming a client as this category.

## Dies structurally in v3 (do not port)
- Empty-element/separator hacks (`.wf-empty`, `[lib="separator-*"]:empty`, `::before` space chain) → conditional rendering.
- All carrier plumbing: visibility `:has()` blocks, font-weight cascade blocks (~130 lines → the Weight prop), `.display-contents`, `.inherit-color`.
- Client-first utilities (`.margin-0` family, `.hide-*`, `.container-*` centering).
- Nested-grid defensive resets (`--grid-cols-count: initial`, nested order resets): a nested v3 Grid is its own shadow root — leakage impossible.
- v1 breakpoint column overrides were equal-columns only (`repeat(1..10, 1fr)`); ratios were desktop-only.

## Stays page-level site CSS (native Webflow content, not v3's job)
Body font-smoothing/text-rendering, link/input typography-inherit block, blockquote unset, third-party fixes (Velt).

## Needs a decision before migration
Line-clamp (`text-style-2/3lines` → Clamp option on Text?) · `[breakpoint=…]` element swapping (mobile-specific image — already on v1-parity's list) · no-gutter-left/right overrides (v1-parity says deliberately dropped — dead unless a design resurrects it).
