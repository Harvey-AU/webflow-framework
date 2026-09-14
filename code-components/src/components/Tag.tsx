import type { CSSProperties, ReactNode } from "react";
import { cssVar, tokenValue, type CornersOption } from "@/src/tokens";
import {
  buttonColourVars,
  buttonFamilyClass,
  BUTTON_RESTING_CSS,
  SIZE_PADDING,
  type ButtonColour,
  type ButtonSize,
  type IconChoice,
} from "./Button";
import { Icon } from "./Icon";

/**
 * v3 Tag — looks exactly like Button (same colour/size/corner vocabulary and
 * the same v2-verified resting styles) but is a plain div: no link, no hover,
 * no focus. Only the resting rules ship — no hover CSS at all.
 * Optional icons either side of the text (user 2026-09-14).
 */
export type TagProps = {
  text?: ReactNode;
  colour?: ButtonColour;
  size?: ButtonSize;
  corners?: CornersOption;
  iconBefore?: IconChoice;
  iconAfter?: IconChoice;
};

const TAG_CSS = `
${BUTTON_RESTING_CSS}
.btn { cursor: default; }
`;

export function Tag({
  text = "Tag",
  colour = "standard",
  size = "standard",
  corners = "button",
  iconBefore = "none",
  iconAfter = "none",
}: TagProps) {
  const style = {
    ...buttonColourVars(colour),
    "--btn-p": SIZE_PADDING[size],
    "--btn-r": tokenValue("corners", corners),
    "--btn-gap": cssVar("sizing-spacer-gap---gap--icon-base"),
  } as CSSProperties;
  return (
    <div className={`btn ${buttonFamilyClass(colour)}`} style={style}>
      <style>{TAG_CSS}</style>
      {iconBefore !== "none" && <Icon glyph={iconBefore} />}
      <span>{text}</span>
      {iconAfter !== "none" && <Icon glyph={iconAfter} />}
    </div>
  );
}
