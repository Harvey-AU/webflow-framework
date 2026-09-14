import type { CSSProperties, ReactNode } from "react";
import {
  typeSize,
  tokenValue,
  cssVar,
  type TypeSizeOption,
  type TextAlignOption,
  type ColourOption,
} from "@/src/tokens";

/**
 * v3 RichText. Two styles, ported from v1's two rich text classes
 * (user 2026-09-13): `standard` uses the hr semantic variables,
 * `article` swaps them for the hr-article set. Content rules carry the
 * v1 baseline: first/last margin trim, links in currentColor, hr from
 * variables, buttons-in-content spacing.
 */
export type RichTextStyle = "standard" | "article";

export type RichTextProps = {
  content?: ReactNode;
  styleMode?: RichTextStyle;
  size?: TypeSizeOption | "inherit";
  align?: TextAlignOption | "inherit";
  colour?: ColourOption;
};

const RT_CSS = `
.rt > :first-child { margin-top: 0; }
.rt > :last-child { margin-bottom: 0; }
.rt a:not(.button) { color: currentColor; }
.rt sub { bottom: unset; }
.rt hr {
  border: none;
  border-top: var(--rt-hr-w) solid var(--rt-hr-c);
  margin-top: var(--rt-hr-mt);
  margin-bottom: var(--rt-hr-mb);
}
.rt .button {
  display: inline-block;
  text-decoration: none;
  margin-right: var(--_sizing-button---rich-text--margin-right, ${cssVar("sizing-spacer-gap---padding--small")});
  margin-top: var(--_sizing-button---rich-text--margin-top, ${cssVar("sizing-spacer-gap---padding--medium")});
  margin-bottom: var(--_sizing-button---rich-text--margin-bottom, ${cssVar("sizing-spacer-gap---padding--large")});
}
`;

export function RichText({
  content,
  styleMode = "standard",
  size = "inherit",
  align = "inherit",
  colour = "inherit",
}: RichTextProps) {
  const suffix = styleMode === "article" ? "-article" : "";
  const sized = size === "inherit" ? undefined : typeSize(size);
  const style = {
    fontSize: sized?.fontSize,
    lineHeight: sized?.lineHeight,
    textAlign: align === "inherit" ? undefined : tokenValue("textAlign", align),
    color: tokenValue("colour", colour), // undefined for inherit
    "--rt-hr-w": cssVar(`sizing-border-corner---border--hr${suffix}`),
    "--rt-hr-c": cssVar(`colour-semantic---border--hr${suffix}`),
    "--rt-hr-mt": cssVar(`sizing-spacer-gap---padding--hr-top${suffix}`),
    "--rt-hr-mb": cssVar(`sizing-spacer-gap---padding--hr-bottom${suffix}`),
  } as CSSProperties;
  return (
    <div className="rt" style={style}>
      <style>{RT_CSS}</style>
      {content}
    </div>
  );
}
