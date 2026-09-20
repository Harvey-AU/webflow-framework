import { createElement, type CSSProperties, type ReactNode } from "react";
import {
  typeSize,
  tokenValue,
  cssVar,
  type TypeSizeOption,
  type WeightOption,
  type TextAlignOption,
} from "@/src/tokens";
import { TYPE_CSS, decorationStyle, type DecorationOption } from "./typography";

/**
 * v3 Heading. Tag is SEO-only; Size is separate. `Size: inherit` resolves to
 * the TAG's size variables (--_font---size--tag--h2 etc.) — deliberately,
 * because inside a shadow root the site's heading classes can't reach us, so
 * "the tag's size" must come from the tag variables, not the cascade.
 * Font family likewise: always the tag's family variable
 * (--_font---family--tag--h2 etc. — the framework's fonts/base.css set);
 * unset on a site, it falls back to the inherited body font.
 */
export type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type HeadingProps = {
  text?: ReactNode;
  tag?: HeadingTag;
  size?: TypeSizeOption | "inherit";
  weight?: WeightOption | "inherit";
  align?: TextAlignOption | "inherit";
  decoration?: DecorationOption;
};

export function Heading({
  text = "Heading",
  tag = "h2",
  size = "inherit",
  weight = "inherit",
  align = "inherit",
  decoration = "none",
}: HeadingProps) {
  const sized = typeSize(size === "inherit" ? tag : size);
  const style: CSSProperties = {
    fontFamily: cssVar(`font---family--tag--${tag}`),
    fontSize: sized.fontSize,
    lineHeight: sized.lineHeight,
    letterSpacing: sized.letterSpacing,
    // inherit resolves to the tag's weight variable — otherwise the browser's
    // default bold wins inside the shadow root, whatever the site's tag weight.
    fontWeight: weight === "inherit" ? cssVar(`font---weight--tag--${tag}`) : tokenValue("weight", weight),
    textAlign: align === "inherit" ? undefined : (tokenValue("textAlign", align) as CSSProperties["textAlign"]),
    ...decorationStyle(decoration),
  };
  return createElement(
    tag,
    { className: "t", style },
    <style>{TYPE_CSS}</style>,
    text,
  );
}
