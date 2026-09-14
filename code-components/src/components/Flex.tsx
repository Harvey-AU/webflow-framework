import type { CSSProperties, ReactNode } from "react";
import { tokenValue, type GapOption } from "@/src/tokens";

/**
 * v3 Flex — row/column group for buttons, tags and the like. A row centres
 * items on the cross axis, a column stretches them (v2's documented
 * behaviour). Direction can flip at mobile L so button rows stack below
 * 767px. No wrap by default (decided 2026-09-13).
 */
export type FlexDirection = "row" | "column";
export type FlexDirectionOverride = FlexDirection | "inherit";
export type FlexWrap = "no-wrap" | "wrap";

export type FlexProps = {
  direction?: FlexDirection;
  directionMobileL?: FlexDirectionOverride;
  gap?: GapOption;
  wrap?: FlexWrap;
  children?: ReactNode;
};

const FLEX_CSS = `
.flex {
  display: flex;
  width: 100%;
  flex-direction: var(--fd, row);
  align-items: var(--fai, center);
}
.flex > * { min-width: 0; }
/* Dissolve Webflow's single slot wrapper so each dropped element is its own
   flex item (see code-conventions.md, slot DOM). No-op in local preview. */
::slotted([slot]) { display: contents; }
@media (max-width: 767px) {
  .flex {
    flex-direction: var(--fd-ml, var(--fd, row));
    align-items: var(--fai-ml, var(--fai, center));
  }
}
`;

const crossAxis = (dir: FlexDirection) => (dir === "row" ? "center" : "stretch");

export function Flex({
  direction = "row",
  directionMobileL = "inherit",
  gap = "small",
  wrap = "no-wrap",
  children,
}: FlexProps) {
  const dirML = directionMobileL === "inherit" ? direction : directionMobileL;
  const style = {
    gap: tokenValue("gap", gap),
    flexWrap: wrap === "wrap" ? ("wrap" as const) : ("nowrap" as const),
    "--fd": direction,
    "--fai": crossAxis(direction),
    "--fd-ml": dirML,
    "--fai-ml": crossAxis(dirML),
  } as CSSProperties;
  return (
    <div className="flex" style={style}>
      <style>{FLEX_CSS}</style>
      {children}
    </div>
  );
}
