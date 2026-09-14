import type { CSSProperties } from "react";
import { Spacer } from "./Spacer";
import { tokenValue, type BorderOption, type ColourOption, type SpacerOption } from "@/src/tokens";

/**
 * v3 HorizontalLine — divider with two built-in spacers, above and below
 * (kept built-in deliberately: it almost always needs them). Thickness and
 * colour default to the semantic hr variables v1 used, so sites keep theming
 * dividers the same way.
 */
const NS = "harvey-components-jan-25";
const hrVar = (path: string) => `var(--_${path}, var(--${NS}_${path}))`;

export type LineThickness = "hr" | Exclude<BorderOption, "none" | "button">;
export type LineColour = "hr" | ColourOption;

export type HorizontalLineProps = {
  thickness?: LineThickness;
  colour?: LineColour;
  spacerAbove?: SpacerOption;
  spacerBelow?: SpacerOption;
};

export function HorizontalLine({
  thickness = "hr",
  colour = "hr",
  spacerAbove = "xxsmall",
  spacerBelow = "xsmall",
}: HorizontalLineProps) {
  const size =
    thickness === "hr"
      ? hrVar("sizing-border-corner---border--hr")
      : tokenValue("border", thickness);
  const lineColour =
    colour === "hr"
      ? hrVar("colour-semantic---border--hr")
      : (tokenValue("colour", colour) ?? "currentColor"); // colour "inherit" → currentColor
  const style: CSSProperties = {
    border: "none",
    margin: 0,
    width: "100%",
    borderTop: `${size} solid ${lineColour}`,
  };
  return (
    <div>
      <Spacer size={spacerAbove} />
      <hr style={style} />
      <Spacer size={spacerBelow} />
    </div>
  );
}
