import { createElement, type CSSProperties, type ReactNode } from "react";
import { RichText, type RichTextStyle } from "./RichText";
import { Icon } from "./Icon";
import type { GlyphName } from "@/src/icons/glyphs";
import {
  typeSize,
  tokenValue,
  cssVar,
  type TypeSizeOption,
  type WeightOption,
  type TextAlignOption,
  type ColourOption,
  type CornersOption,
  type PaddingOption,
} from "@/src/tokens";

/**
 * v3 Accordion — one FAQ item on native `<details>/<summary>`: no JS state,
 * SSR'd open state, keyboard/screen-reader semantics for free, icon flip in
 * CSS. The FAQ list is composition (a Stack of items). The body is the real
 * RichText component, so its settings match RichText by construction.
 *
 * Open state: background swaps to `backgroundOpen` and a thin border driven
 * by the hr variables appears (same set HorizontalLine uses). The border is
 * present-but-transparent when closed so opening never shifts layout.
 *
 * Body indentation: with the icon before the title, the body left-aligns
 * with the TITLE (indent = icon box + gap), per the design; icon after (or
 * none) leaves the body at the padding edge. The icon sits in a fixed
 * 1.35×title-font-size box so the indent is identical for every glyph.
 *
 * Known trade-off: no open/close height animation in v1 of this block —
 * animating `<details>` cleanly needs JS or Chrome-only CSS.
 */
export type AccordionIconPosition = "before" | "after";
export type AccordionTitleTag = "h2" | "h3" | "h4" | "h5" | "h6";
/** As HorizontalLine: `hr` = the site's divider colour variable. */
export type AccordionBorderColour = "hr" | ColourOption;

export type AccordionProps = {
  title?: ReactNode;
  body?: ReactNode;
  startOpen?: boolean;
  icon?: GlyphName | "none";
  iconPosition?: AccordionIconPosition;
  titleTag?: AccordionTitleTag;
  titleSize?: TypeSizeOption | "inherit";
  titleWeight?: WeightOption | "inherit";
  background?: ColourOption;
  backgroundOpen?: ColourOption;
  borderColour?: AccordionBorderColour;
  corners?: CornersOption;
  padding?: PaddingOption;
  bodyStyle?: RichTextStyle;
  bodySize?: TypeSizeOption | "inherit";
  bodyAlign?: TextAlignOption | "inherit";
  bodyColour?: ColourOption;
};

const ACC_CSS = `
.acc {
  display: block;
  background: var(--acc-bg);
  border-radius: var(--acc-r);
  border: var(--acc-hr-w) solid transparent;
}
.acc[open] {
  background: var(--acc-bg-open);
  border-color: var(--acc-hr-c);
}
.acc-sum {
  display: flex;
  align-items: center;
  gap: var(--acc-gap);
  padding: var(--acc-p);
  font-family: var(--acc-ff);
  font-size: var(--acc-fs);
  line-height: var(--acc-lh);
  letter-spacing: var(--acc-ls);
  font-weight: var(--acc-fw, inherit);
  cursor: pointer;
  list-style: none;
}
.acc-sum::-webkit-details-marker { display: none; }
/* Page CSS can't reach into the shadow root, so the keyboard focus ring
   lives here (v1 framework's focus style, as Button). */
.acc-sum:focus-visible { outline: 0.125rem solid currentColor; outline-offset: 0.125rem; }
.acc-title { margin: 0; font-size: inherit; line-height: inherit; font-weight: inherit; }
.acc-ic {
  flex: none;
  width: calc(var(--acc-fs) * 1.35);
  display: inline-flex;
  justify-content: center;
  transition: rotate 150ms ease;
}
.acc-ic-after { margin-left: auto; }
.acc[open] .acc-ic { rotate: 180deg; }
.acc-body {
  padding: 0 var(--acc-p) var(--acc-p) calc(var(--acc-p) + var(--acc-indent));
}
`;

export function Accordion({
  title = "Question",
  body,
  startOpen = false,
  icon = "arrow-down",
  iconPosition = "before",
  titleTag = "h3",
  titleSize = "medium",
  titleWeight = "inherit",
  background = "neutral-lightest",
  backgroundOpen = "white",
  borderColour = "hr",
  corners = "xsmall",
  padding = "medium",
  bodyStyle = "standard",
  bodySize = "inherit",
  bodyAlign = "inherit",
  bodyColour = "inherit",
}: AccordionProps) {
  const sized = typeSize(titleSize === "inherit" ? titleTag : titleSize);
  const hasIcon = icon !== "none";
  const indented = hasIcon && iconPosition === "before";
  const style = {
    "--acc-bg": tokenValue("colour", background), // undefined (inherit) → transparent
    "--acc-bg-open": tokenValue("colour", backgroundOpen),
    "--acc-r": tokenValue("corners", corners),
    "--acc-p": tokenValue("padding", padding),
    "--acc-gap": tokenValue("gap", "xsmall"),
    "--acc-ff": cssVar(`font---family--tag--${titleTag}`), // shadow root: the tag's family must come from variables, as Heading
    "--acc-fs": sized.fontSize,
    "--acc-lh": sized.lineHeight,
    "--acc-ls": sized.letterSpacing,
    // inherit resolves to the tag's weight variable — otherwise the summary's
    // heading tag renders browser-default bold inside the shadow root, as Heading.
    "--acc-fw":
      titleWeight === "inherit" ? cssVar(`font---weight--tag--${titleTag}`) : tokenValue("weight", titleWeight),
    "--acc-hr-w": cssVar("sizing-border-corner---border--hr"),
    "--acc-hr-c":
      borderColour === "hr"
        ? cssVar("colour-semantic---border--hr")
        : (tokenValue("colour", borderColour) ?? "currentColor"), // colour "inherit" → currentColor

    "--acc-indent": indented ? "calc(var(--acc-fs) * 1.35 + var(--acc-gap))" : "0rem",
  } as CSSProperties;
  const iconBox = hasIcon && (
    <span className={`acc-ic${iconPosition === "after" ? " acc-ic-after" : ""}`}>
      <Icon glyph={icon} />
    </span>
  );
  return (
    <details className="acc" style={style} open={startOpen || undefined}>
      <summary className="acc-sum">
        {iconPosition === "before" && iconBox}
        {createElement(titleTag, { className: "acc-title" }, title)}
        {iconPosition === "after" && iconBox}
      </summary>
      <style>{ACC_CSS}</style>
      <div className="acc-body">
        <RichText content={body} styleMode={bodyStyle} size={bodySize} align={bodyAlign} colour={bodyColour} />
      </div>
    </details>
  );
}
