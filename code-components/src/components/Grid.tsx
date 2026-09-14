import type { CSSProperties, ReactNode } from "react";
import {
  tokenValue,
  type ColumnsOption,
  type GapOption,
  type AlignmentOption,
} from "@/src/tokens";

/**
 * v3 Grid — CSS grid with responsive column and direction axes.
 *
 * Values flow in as inline custom properties; the static stylesheet below
 * carries the structure (the two breakpoint tiers). Column fr values are the
 * v1/v2 vocabulary verbatim (tokens.json `columns` scale).
 *
 * Reverse is CSS-only, because the server can't know the viewport:
 * - multi-column reverse → `direction: rtl` on the grid (children reset to
 *   ltr), mirroring column order for any child count;
 * - stacked (one column) reverse → the tier switches to flex
 *   `column-reverse`, which handles any child count. Never v1's
 *   order-juggling hack, which silently broke past three children.
 */

export type GridDirection = "standard" | "reverse";
export type GridDirectionOverride = GridDirection | "inherit";
export type GridColumnsOverride = ColumnsOption | "inherit";

export type GridProps = {
  columns?: ColumnsOption;
  columnsTablet?: GridColumnsOverride;
  columnsMobileL?: GridColumnsOverride;
  columnGap?: GapOption;
  rowGap?: GapOption;
  direction?: GridDirection;
  directionTablet?: GridDirectionOverride;
  directionMobileL?: GridDirectionOverride;
  valign?: AlignmentOption;
  children?: ReactNode;
};

/* Every tier's value is computed in JS and set explicitly, so no tier
   inherits a mode it shouldn't; the var() fallbacks are safety only.
   min-width: 0 on items prevents long content blowing the track sizes. */
const GRID_CSS = `
.grid {
  display: var(--disp, grid);
  width: 100%;
  grid-template-columns: var(--cols);
  flex-direction: column-reverse;
  direction: var(--dir, ltr);
  align-items: var(--ai, center);
}
.grid > * { direction: ltr; min-width: 0; }
/* Webflow wraps ALL slot content in one light-DOM div (slot="children") —
   without this rule that wrapper is the grid's only item and everything
   piles into the first cell. display: contents dissolves it so each dropped
   element's own wrapper div becomes a grid cell. Kept as a separate rule:
   in the shadow-less local preview it simply matches nothing.
   Verified against published DOM 2026-09-13. */
::slotted([slot]) { display: contents; direction: ltr; }
@media (max-width: 991px) {
  .grid {
    display: var(--disp-t, grid);
    grid-template-columns: var(--cols-t, var(--cols));
    direction: var(--dir-t, ltr);
    align-items: var(--ai-t, var(--ai, center));
  }
}
@media (max-width: 767px) {
  .grid {
    display: var(--disp-ml, grid);
    grid-template-columns: var(--cols-ml, 1fr);
    direction: var(--dir-ml, ltr);
    align-items: var(--ai-ml, var(--ai, center));
  }
}
`;

type TierMode = { cols: ColumnsOption; flex?: true; rtl?: true };

/**
 * Reverse semantics per tier:
 * - multi-column reverse mirrors (rtl), wherever the reverse came from;
 * - stacked reverse flips vertically (flex) ONLY when the reverse was set on
 *   a breakpoint axis. Reverse inherited from desktop un-reverses when
 *   stacked — a desktop mirror says nothing about vertical order.
 */
function tierMode(cols: ColumnsOption, dir: GridDirection, explicitBp: boolean): TierMode {
  const stacked = cols === "one";
  if (dir !== "reverse") return { cols };
  if (stacked) return explicitBp ? { cols, flex: true } : { cols };
  return { cols, rtl: true };
}

export function Grid({
  columns = "two-50-50",
  columnsTablet = "inherit",
  columnsMobileL = "inherit",
  columnGap = "medium",
  rowGap = "medium",
  direction = "standard",
  directionTablet = "inherit",
  directionMobileL = "inherit",
  valign = "center",
  children,
}: GridProps) {
  const colsT = columnsTablet === "inherit" ? columns : columnsTablet;
  // Auto-stack: nothing set on either breakpoint axis → one column at <=767.
  const colsML =
    columnsMobileL !== "inherit"
      ? columnsMobileL
      : columnsTablet === "inherit"
        ? "one"
        : colsT;

  const dirTExplicit = directionTablet !== "inherit";
  const dirMLExplicit = directionMobileL !== "inherit";
  const dirT = dirTExplicit ? directionTablet : direction;
  const dirML = dirMLExplicit ? directionMobileL : dirT;

  const base = tierMode(columns, direction, false);
  const t = tierMode(colsT, dirT, dirTExplicit);
  const ml = tierMode(colsML, dirML, dirMLExplicit || dirTExplicit);

  // In a flex (stacked-reverse) tier align-items acts on the cross axis and
  // `center` would shrink children to content width, so flex tiers get
  // stretch; every other tier keeps the chosen vertical alignment.
  const align = (tier: TierMode) =>
    tier.flex ? "stretch" : tokenValue("alignment", valign);

  const style = {
    columnGap: tokenValue("gap", columnGap),
    rowGap: tokenValue("gap", rowGap),
    "--ai": align(base),
    "--ai-t": align(t),
    "--ai-ml": align(ml),
    "--cols": tokenValue("columns", base.cols),
    "--cols-t": tokenValue("columns", t.cols),
    "--cols-ml": tokenValue("columns", ml.cols),
    ...(base.rtl && { "--dir": "rtl" }),
    ...(base.flex && { "--disp": "flex" }),
    ...(t.rtl && { "--dir-t": "rtl" }),
    ...(t.flex && { "--disp-t": "flex" }),
    ...(ml.rtl && { "--dir-ml": "rtl" }),
    ...(ml.flex && { "--disp-ml": "flex" }),
  } as CSSProperties;

  return (
    <div className="grid" style={style}>
      <style>{GRID_CSS}</style>
      {children}
    </div>
  );
}
