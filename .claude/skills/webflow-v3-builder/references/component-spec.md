# v3 component set — props, in declaration order
Groups and order matter: they are the Designer panel. `Show` first in every group. Variant options are the token names from `design-tokens.md`.

**BUILD STATUS 2026-09-14 (overnight build):** ALL components below are written in code (`code-components/src/components/`): Container, Grid, Stack, Flex, Spacer, HorizontalLine, Heading, Text, Icon (49 glyphs extracted to `src/icons/glyphs.ts` via `scripts/extract-icons.mjs`), Button, Tag, Image, RichText, Breadcrumb. Typechecked clean 2026-09-14. Button colour semantics VERIFIED against the v2 stylesheet (playground embed 6): every family carries a 1px border (filled = bg colour, prevents layout shift), outline fills on hover, no-fill shifts ink to hover-bg, hover-N starts swapped, **text-N strips side padding and border**. Decoration is native text-decoration (thickness + offset = -gap), adopted from v2's delta embed — NOT v1's ::after bars. Gallery harness: `preview/blocks.html`.

## Layout

### Container  (also serves as Card — v2 proved a card is a container plus corners/border)
Slot: children.
`Show` · `Padding top` · `Padding bottom` · `Padding sides` · `Background colour` · `Text colour` · `Container width` · `Gutters` · `Corners` (BUILT 2026-09-15 — border-radius, for card-style containers) · `Border` · `Border colour` · `ID`
Behaviour: full-bleed background; **Container width constrains the CONTENT, not the box** — otherwise a coloured band can't span the viewport. In v2 this was `--container-max` inherited by children; in code, apply max-width to the inner wrapper.

### Grid
Slot: children (each direct child is a grid item).
`Show` · `Columns` · `Columns tablet` · `Columns mobile L` (breakpoint axes default `inherit`; NO mobile-P axis — dropped 2026-09-11, ≤767 value carries down) · `Column gap` · `Row gap` · `Direction` · `Direction tablet` · `Direction mobile L` (standard/reverse; breakpoint axes inherit) · `Vertical alignment`
BUILT 2026-09-11 (`src/components/Grid.tsx`). Reverse semantics as implemented: multi-column reverse = rtl mirror wherever it comes from; stacked reverse flips vertically ONLY when set on a breakpoint axis — reverse inherited from desktop un-reverses on stack.
Defaults from v1 production: Columns `two-50-50`, gaps `medium`, alignment `center`.
Reverse implementation: stacked+reverse → `flex-direction: column-reverse` in the media query (any child count, gap carries); multi-column reverse → `direction: rtl` on grid + `ltr` reset on children. NEVER v1's `order: 30/20/10` hack — it silently breaks past 3 children. Verify slot-child wrapping on canvas before trusting `grid-template-columns` (v2 ledger: slot wrappers broke grids twice).

### Stack  (vertical flex column)
Slot. `Show` · `Alignment` (stretch/start/center/end, default stretch — the ONLY setting, decided 2026-09-13). Spacing between children comes from Spacer blocks, not a gap — deliberate, so spacing is visible in the tree.
BUILT 2026-09-13 (`src/components/Stack.tsx`).

### Flex  (row/column group, e.g. buttons or tags)
Slot. `Show` · `Direction` (row/column, default row) · `Direction mobile L` (inherit/row/column, applies ≤767 — added 2026-09-13, e.g. stack a button row on mobile) · `Gap` (gap scale, default small — judgment call, no v1 evidence) · `Wrap` (no-wrap/wrap, default **no-wrap** — decided 2026-09-13, overrides v2's wrap-by-default) · row centres items, column stretches them.
BUILT 2026-09-13 (`src/components/Flex.tsx`).

## Content blocks

### Heading
`Show` · `Text` · `Tag` (h1–h6, SEO only; default **h2**) · `Size` (tag sizes + numeric scale, **separate from Tag**; default **inherit** = the tag's size) · `Weight` · `Align` · `Decoration` (full v1 set: none/underline-1/2/3/strike-through — user 2026-09-13)
**NO Font family prop** (user 2026-09-13): families come from site variables only — avoids the CAF not-installed-font trap.

### Text (paragraph)
`Show` · `Text` · `Size` · `Weight` · `Align` · `Decoration` (full v1 set) · `Show icon` + `Icon` (glyph after the text, inline)
No Font family prop (same ruling as Heading). Also used as the label inside Button and Tag, so button typography follows this component.

### Rich text
`Show` · `Rich text` · `Style` (standard/article, default standard — v1 had two rich text modes, `.text-rich-text` vs `.text-rich-text_article`; article swaps the hr styling to the `hr-article` semantic variables. Follow that split, user 2026-09-13) · `Size` · `Align` · `Colour`
No Decoration prop (dropped 2026-09-13 — decorating a whole rich text block underlines everything; links are styled by the content rules). No Font family prop (same ruling as Heading).
⚠️ The Webflow API can only write **plain** inner text to a rich text field — formatting is a manual/Designer step. Budget ~5% manual on migration.

### Button
`Show` · `Text` · `Link` · `Colour` (ALL 44 options confirmed 2026-09-13: standard · colour-1…10 · outline-1…10 · outline-no-fill-1…3 · hover-1…10 · text-1…10) · `Size` (standard, xshort-narrow, short-narrow, short, wider, no-side-padding, no-padding) · `Corners` · `Show icon` (default ON) + `Icon` (default glyph `arrow-stem-up-right` — v1/CAF behaviour, confirmed 2026-09-13)
Carries its own `:focus-visible` ring (shadow DOM — page CSS can't provide it).
Structure: a link containing a Text label — so size/weight/family/decoration are inherited, not duplicated. Hover states come from the semantic colour layer.

### Tag
Identical styling to Button, **no link and no hover**. `Show` · `Text` · `Colour` · `Size` · `Corners`

### Image — surface decided 2026-09-13, not yet built
`Show` · `Image` · `Image mobile` (optional second asset swapped in ≤767 — KEPT per user 2026-09-13; acts as an OVERRIDE: blank OR Webflow's placeholder.svg = main image everywhere. The Designer fills unset Image props with the placeholder, so components must guard for it — verified CAF DOM 2026-09-14. MECHANISM: two imgs + media-query visibility, NOT <picture> — picture hit a Webflow limitation and was reverted, user 2026-09-15) · `Ratio` (default **auto** — confirmed 2026-09-13 over v1's 1x1; auto never crops) · `Fit` (cover/contain, default cover — replaces v1's Format boolean pair; v2 hardcoded cover, which crops logos) · `Corners` · `Max width` (25/33/50/66/75/90/100 %) · `Align` (matters only when max width < 100) · `Loading` (lazy/eager, default lazy — replaces v1's boolean pair; heroes need eager for LCP) · `Custom style` (Text input applied as inline style overrides — USER DECISION 2026-09-13 re-admitting the escape hatch v1-parity dropped, Image only for now. Guardrail: any override used on a second instance graduates to a real prop.)
NO Alt prop (user 2026-09-13): alt rides on the asset through the Image prop's `{src, alt?}`. Verify at build that asset alt actually arrives — if it doesn't, that's an accessibility hole to raise, not silently accept.
Deliberately absent: caption (= Text under Image in a Stack — composition), background image, per-side corners, line-over-image, breakpoint visibility.
`Width px` (Number, 0 = fill container — CLOSED 2026-09-14 the fixed-px gap v1/v2 never had; for logos/icons. A px width still gets a 100% max-width cap so it can't overflow).
`Mobile width px` (Number, 0 = no override — added per user 2026-09-17; overrides Width px ≤767. Width moved off inline style into the component's static CSS via `--img-w`/`--img-w-m` custom properties, Grid's fallback-chain pattern, so a `width` in Custom style — inline — still beats both on every breakpoint).

### Spacer
`Show` · `Size` (spacer scale — stops at xlarge; default small = 3rem on the library) · `Size mobile` (inherit + spacer scale, applies ≤767 — added per user 2026-09-13) · `Axis` (vertical/horizontal, default vertical)
Resolved library values (via padding aliases, read 2026-09-13): xtiny .5 · tiny .75 · xxxsmall 1 · xxsmall 1.5 · xsmall 2 · small 3 · medium 5 · large 8 · xlarge 12 · custom-1 5 · custom-2 12 · custom-3 90 (rem).

### HorizontalLine  (build AFTER Spacer — user 2026-09-13)
Resurrected from v1 (was on the deferred list). A divider with **two built-in spacers, above and below** — kept built-in deliberately because it almost always needs them (a default mini-composition).
`Show` · `Thickness` (hr + border scale, default **hr** → `--_sizing-border-corner---border--hr`) · `Colour` (hr + colour options, default **hr** → `--_colour-semantic---border--hr`) · `Spacer above` (spacer scale, default **xxsmall** ≈ v1's 1.5rem hr-top) · `Spacer below` (spacer scale, default **xsmall** ≈ v1's 2rem hr-bottom)
The hr defaults keep sites theming dividers through the same semantic variables v1 used.

### Icon
`Show` · `Glyph` · `Size` · `Colour` · `Weight` (Number, stroke-width — user 2026-09-13: "sometimes stroke is too much". Only affects stroke-based glyphs; filled glyphs ignore it — establish which are which during mask extraction and note per glyph). **All ~60 v1 glyphs ship** (user 2026-09-13 — as v1, no starter-set trim); see `icons.md`. Inline SVG, names are the API.

### Breadcrumb
`Show` · `Home text` · `Item 1 text/link` · `Item 2 show/text/link` · `Item 3 show/text/link` · `Size` · `Colour`
v1's `e_breadcrumb` is good and reusable; port its behaviour.

## Sections (compositions) — NOT library components (layer model, 2026-09-11)
These trees are ASSEMBLY RECIPES: built as native Designer components in the site template (boilerplate for duplicated client sites), or composed per design from library molecules. Promoted to the library only under the rule of three, as thin slot-based layouts.

### TextAndImage
`Container > Grid > [Stack > (Breadcrumb?) (Sub heading?) Heading, Spacer, Rich text, Spacer, Text, Spacer, Button, Button 2] + Image`
Every content block gets a `Show`. Breadcrumb and Sub heading are optional **blocks with Show**, never modes.

### CardGrid
`Container > Grid > N × Card`. For CMS, the grid is replaced by the Collection Wrapper (client-first classes) — the card is unchanged.

### Card — Icon + Text (pattern, not a fixed component)
`Stack > Image(icon), Spacer, Heading, Spacer, Text`. Props: `Show · Icon · Icon alt · Title · Body`.
**Rule learned:** when a layout repeats with only content differing, make it a component and use N instances. Do not hand-build N copies.

## Deferred (build only when a design needs it)
Video · Quote · Author · corners-per-side · border-per-side · caption · background image.
(No longer deferred: Line/divider → HorizontalLine above; image object-fit → Image `Fit`; mobile-specific image → Image `Image mobile`.)
