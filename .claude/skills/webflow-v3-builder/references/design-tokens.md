# Design tokens — the corrected vocabulary

## How to reference a variable (verified from attr-v2.css on the V2 playground, 2026-09-11)
Always the two-level chain: `var(--_<path>, var(--harvey-components-jan-25_<path>))`.
The `--_` form is how Webflow emits the site's own variables; the `harvey-components-jan-25_` form is how the shared library's variables are namespaced on client sites that installed it. The dual reference makes the same CSS work in both contexts. Options with no token behind them use literals in v2: `zero`→`0`, `circle`→`50%`, columns→`fr` fractions, button-size paddings hardcoded rem, image max-width percentages. Breakpoints are max-width media queries (991/767/479); `inherit` = emit no rule.
**Use these lists verbatim as `props.Variant` options.** Several v2 carriers offered values with no variable behind them and rendered nothing; these are the verified sets. Variable names are the library's; each site overrides the values.

## Spacing
**Padding** `--_sizing-spacer-gap---padding--{v}`
`zero`(literal 0) xtiny tiny xxsmall xsmall small medium large xlarge xxlarge huge xhuge **xxhuge custom-1 custom-2 custom-3**

**Gap** `--_sizing-spacer-gap---gap--{v}`
zero tiny xxsmall xsmall small medium large xlarge xxlarge huge xhuge

**Spacer** `--_sizing-spacer-gap---spacer--{v}` — ⚠️ **stops at xlarge**
xtiny tiny xxxsmall xxsmall xsmall small medium large xlarge custom-1 custom-2 custom-3
There is **no** spacer xxlarge/huge/xhuge. v2 offered them and they silently rendered zero height. Also note the spacer scale maps onto padding primitives, so spacer `medium` ≈ 5rem on the library — bigger than the name suggests.

## Type
**Sizes** `--_font---size--{v}` + matching `--_font---height--{v}`
tiny xxxsmall xxsmall xsmall small medium large xlarge xxlarge xxxlarge huge xhuge

**Tag sizes** `--_font---size--tag--{v}` — h1 h2 h3 h4 h5 h6 p breadcrumb (also tooltip, video-title)

**Weights** `--_font---weight--{v}` — light normal medium semibold bold xbold
**Families** `--_font---family--{1,2,3}` — ⚠️ on CAF these are framework defaults (Georgia / Arial), not brand fonts. Mona Sans was **not installed**; pointing tokens at it fell back to Times. Check a font is loaded before repointing.
**Tag families** `--_font---family--tag--{h1,h2,h3,h4,h5,h6,p,breadcrumb,tooltip,blockquote}` + `--_font---family--base` (verified in the v1 framework's `src/css/framework-mapping/fonts/base.css`, 2026-09-20). ⚠️ Shadow-root components do NOT get the site's heading font by inheritance — only the body font crosses the boundary. Heading/Accordion set `font-family: var(--_font---family--tag--<tag>, …)` themselves (bug found + fixed 2026-09-20); any future text-bearing block rendering a heading tag must do the same. Rich text has its own set: `--_font-rich-text---family--tag--{…,-article}` (`fonts/rich-text.css`) — the v3 RichText component does not reference families yet.
**Decoration** none · underline-1/2/3 (use `--_font---underline--{n}-size` for thickness and `-gap` for offset) · strike-through
**Letter spacing** — two sets, parallel to sizes (verified in `fonts/base.css`, 2026-09-20): scale `--_font---letter-spacing--{default,tiny,xxxsmall…xhuge}` and per-tag `--_font---letter-spacing--tag--{headings,default,h1…h6,p,breadcrumb}`. Wired into `typeSize()` (tokens.json `spacing` field) 2026-09-20 — tag options resolve the tag spacing variable, scale options the scale one. Heading/Accordion apply it; Text/RichText don't yet (they only pick fontSize/lineHeight). Rich text again has its own: `--_font-rich-text---letter-spacing--tag--{…}`.

## Colour
**Primitives** `--_colour-primitive---brand--{1..6}`, `--_colour-primitive---neutral--{white,black,neutral,lightest,darkest}`
**Semantic button layer** `--_colour-semantic-button---{standard|button-1..10}--{background,text,current-background,current-text,hover-background,hover-text}` (66 variables)
→ Button/Tag colour options (44): `standard` · `colour-1…10` (filled) · `outline-1…10` · `outline-no-fill-1…3` · `hover-1…10` (starts in the hover pair) · `text-1…10` (no fill or border)
`current-*` are unused — they look like nav "current page" states.

## Button sizing
**Paddings** `--_sizing-button---{group}--padding-{top-bottom,left-right}` — groups: `standard` `wide` `short-narrow` `xshort-narrow` ONLY (verified on the Component Library and CAF variable panels 2026-09-20; both panels carry the set — site `--_` first, `--harvey-components-jan-25_` fallback). `Short/padding-*` variables were added by the user 2026-09-20 — the code references `--_sizing-button---short--padding-{top-bottom,left-right}` with the old composite (short-narrow top-bottom + standard left-right) as a nested last-resort fallback for sites that predate them (the API could not yet see them on CL/CAF/Framework at the time; verify propagation before trusting resolved values). The remaining composites: `no-side-padding` = standard top-bottom + 0 · `no-padding` = 0. Do not hardcode the rem literals — v3 Button/Tag `SIZE_PADDING` resolves these variables (corrected 2026-09-20; the literals were a v2-stylesheet snapshot that ignored per-site overrides).
Also in the collection: `--_sizing-button---rich-text--margin-{top,right,bottom}` for buttons inside rich text.

## Corners & borders
**Corners** `--_sizing-border-corner---corner--{v}`: none xsmall small medium large xlarge **full**(pill) custom-1 button image · plus literal `circle` (50%)
⚠️ `button` is **0rem** on the library — for a pill use `full`. v2 initially referenced a non-existent `corner-full` and pills were broken.
**Border widths** `--_sizing-border-corner---border--{v}`: xsmall small medium large xlarge button (+ literal `none` = 0)

## Layout
**Container widths** `--_sizing-general---container--{small,medium,large}` (48/80/120rem) + `full`
**Gutters** `--_sizing-general---gutters--{standard,none}` (2.5rem)
**Columns**: one · two-50-50 · two-60-40 · two-40-60 · two-66-33 · two-33-66 · two-70-30 · two-30-70 · three · four · five · six (five/six added 2026-09-15 as repeat literals; + `inherit` for breakpoint axes)
**Breakpoints**: tablet ≤991 · mobile-L ≤767 · mobile-P ≤479 (desktop base; 1920+ exists)
**Ratios**: auto 1x1 3x2 4x3 16x9 2x1 fill
**Alignment**: stretch start center end

## CAF resolved px (for Figma matching)
xsmall 16 (paragraph) · small 18 · medium 20 · large 24 · xlarge 28 · xxlarge 36 · huge 48 · xhuge 56 · h1 44 · h2 36 · gap huge 80 · xhuge 120 · padding custom-1 64 · Brand/1 #0A1B22 · Brand/4 #E6EFDA (mint)
