import type { CSSProperties, ReactNode } from "react";
import {
  typeSize,
  tokenValue,
  cssVar,
  type TypeSizeOption,
  type WeightOption,
  type TextAlignOption,
} from "@/src/tokens";
import { TYPE_CSS, decorationStyle, type DecorationOption } from "./typography";
import { Icon } from "./Icon";
import type { GlyphName } from "@/src/icons/glyphs";

/**
 * v3 Text — paragraph block, also the label inside Button/Tag so button
 * typography follows it. `Size: inherit` resolves to the p-tag variables
 * (shadow root: the site's paragraph styles can't reach us). Optional inline
 * icon after the text, spaced by the icon gap variable as in v1.
 */
export type TextProps = {
  text?: ReactNode;
  size?: TypeSizeOption | "inherit";
  weight?: WeightOption | "inherit";
  align?: TextAlignOption | "inherit";
  decoration?: DecorationOption;
  icon?: GlyphName | "none";
};

export function Text({
  text = "Text",
  size = "inherit",
  weight = "inherit",
  align = "inherit",
  decoration = "none",
  icon = "none",
}: TextProps) {
  const sized = typeSize(size === "inherit" ? "p" : size);
  const style: CSSProperties = {
    fontSize: sized.fontSize,
    lineHeight: sized.lineHeight,
    fontWeight: weight === "inherit" ? undefined : tokenValue("weight", weight),
    textAlign: align === "inherit" ? undefined : (tokenValue("textAlign", align) as CSSProperties["textAlign"]),
  };
  return (
    <p className="t" style={{ ...style, ...decorationStyle(decoration) }}>
      <style>{TYPE_CSS}</style>
      {text}
      {icon !== "none" && (
        <span style={{ marginLeft: cssVar("sizing-spacer-gap---gap--icon-base") }}>
          <Icon glyph={icon} />
        </span>
      )}
    </p>
  );
}
