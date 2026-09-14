import type { CSSProperties } from "react";
import { tokenValue, type SpacerOption } from "@/src/tokens";

/**
 * v3 Spacer — explicit space between blocks, visible in the tree (Stack's
 * spacing deliberately comes from these rather than a gap). The spacer scale
 * runs hotter than its names suggest on the library site: small = 3rem,
 * medium = 5rem, xlarge = 12rem. Size mobile overrides below 767px.
 */
export type SpacerAxis = "vertical" | "horizontal";
export type SpacerSizeOverride = SpacerOption | "inherit";

export type SpacerProps = {
  size?: SpacerOption;
  sizeMobileL?: SpacerSizeOverride;
  axis?: SpacerAxis;
};

const SPACER_CSS = `
.sp-y { display: block; width: 100%; flex: 0 0 auto; height: var(--sp); }
.sp-x { display: inline-block; height: auto; flex: 0 0 auto; width: var(--sp); }
@media (max-width: 767px) {
  .sp-y { height: var(--sp-ml, var(--sp)); }
  .sp-x { width: var(--sp-ml, var(--sp)); }
}
`;

export function Spacer({ size = "small", sizeMobileL = "inherit", axis = "vertical" }: SpacerProps) {
  const style = {
    "--sp": tokenValue("spacer", size),
    ...(sizeMobileL !== "inherit" && { "--sp-ml": tokenValue("spacer", sizeMobileL) }),
  } as CSSProperties;
  return (
    <div className={axis === "horizontal" ? "sp-x" : "sp-y"} style={style} aria-hidden="true">
      <style>{SPACER_CSS}</style>
    </div>
  );
}
