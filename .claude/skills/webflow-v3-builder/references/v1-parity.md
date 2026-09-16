# v1 → v3 parity — what maps, what doesn't
Source: a fresh read of `Library | Text Image` (142 props + 2 slots) during the v2 build. Use as the migration spec.

## Maps directly (same meaning, new home)
| v1 | v3 |
|---|---|
| Section padding top/bottom | Container `Padding top/bottom` |
| Background colour · Text colour | Container `Background colour` · `Text colour` |
| Container size · Gutters | Container `Container width` · `Gutters` |
| Columns + 3 breakpoints · Column gap · Row gap | Grid, same names |
| Image Left/Right (two booleans) | Grid `Direction` (standard/reverse) — cleaner |
| Content Alignment | Stack `Alignment` (horizontal) + Grid `Vertical alignment` |
| #ID | Container `ID` |
| Heading text/tag/size · Show | Heading props |
| Text · size · weight · alignment · font family · decoration | Text props |
| RIch text *(sic)* · align · colour | Rich text props |
| Button text/link/colour/size/corners · Button 2 | Button ×2 |
| Image · alt · ratio · corners · max width · position | Image props |
| Spacer sizes · Show spacer ×4 | Spacer instances |

## Consolidated
- 6 separate v1 image components (image, with-link, all-breakpoints, breakpoint-control…) → **one** Image with props.
- ~35 `u_*` utility components → variant options. Each was a wrapper div per use with **zero CSS of its own**.
- Button text size/weight/family/decoration → inherited from the nested Text label.

## Corrected (v1 was wrong)
- Spacer offered sizes with **no token behind them** (xxlarge/huge/xhuge) — silently zero.
- Pill corner: v1's `button` token is 0rem; the pill is `full`.
- `Image - Format` (archive) and `Line style` were mis-grouped; `Caption - text alignment` actually drives image alignment.

## Deliberately dropped — flag, never silently drop
Extra-heading block (22 props — a section header hidden inside a section; make it a composition if wanted) · Card/Container width (parent grid's job) · image caption (5) · background image (4) · horizontal lines (4 + line-over-image) · button text-separator / 2nd text / text gap · `Custom style` escape hatch · Container left-right padding (redundant with gutters) · gutter overrides · content max width · container position.

## Needs a decision before migration
corners-per-side · border-per-side · image `object-fit` (Standard vs Fill & cover) · mobile-specific image + breakpoint visibility · button `Target` · Multiple-buttons layout (now: Flex).

## Migration procedure
1. Read the v1 instance's props → manifest.
2. Map variant uuid → name → v3 option **by name** (names match tokens by design).
3. Insert v3 section; set props in batched calls (≤10).
4. Anything in "dropped" or "needs a decision" gets **flagged to the human**, not dropped quietly.
5. Remove v1 → read-back diff → snapshot → publish → parse published HTML for content equality.
**Known manual residue:** rich text formatting (API writes plain text only) and v1 slot content (never readable).
