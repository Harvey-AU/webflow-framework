import { useEffect, type CSSProperties, type ReactNode } from "react";
import {
  typeSize,
  tokenValue,
  cssVar,
  type TypeSizeOption,
  type TextAlignOption,
  type ColourOption,
} from "@/src/tokens";

/**
 * v3 RichText. Two styles: `standard` uses the plain hr variables, `article`
 * swaps them for the -article set.
 *
 * Prop-delivered rich text renders as slotted LIGHT DOM
 * (<div class="w-richtext" slot="content">). Neither shadow CSS nor
 * library.globals (also injected per-island into the shadow) can style it,
 * so the stylesheet below goes into document.head once, scoped
 * `.w-richtext[slot]` — it only ever matches rich text slotted into a code
 * component (this Content, Accordion's Body, …), never a site's own rich
 * text. The component renders the same wrapper itself so the local preview
 * is covered by the same rules.
 *
 * Per-tag typography uses the STANDARD variables — static page CSS can't see
 * the Style prop (known gap for article-mode tags); hr styling stays
 * mode-aware through the inherited --rt-hr-* props.
 */
export type RichTextStyle = "standard" | "article";

export type RichTextProps = {
  content?: ReactNode;
  styleMode?: RichTextStyle;
  size?: TypeSizeOption | "inherit";
  align?: TextAlignOption | "inherit";
  colour?: ColourOption;
};

/* Variable shorthands for fonts/rich-text.css. `face` = family/weight/
   letter-spacing; lists have no family variable in v1, so they use p's. */
const t = (part: string, slug: string) => cssVar(`font-rich-text---${part}--tag--${slug}`);
const sp = (name: string) => cssVar(`font-rich-text---spacing--${name}`);
const face = (slug: string, family = slug) =>
  `font-family: ${t("family", family)}; font-weight: ${t("weight", slug)}; letter-spacing: ${t("letter-spacing", slug)};`;

const RT = ".w-richtext[slot]";
const RT_CSS = `
${RT} > :first-child { margin-top: 0; }
${RT} > :last-child { margin-bottom: 0; }
${RT} a:not(.button) { color: currentColor; }
${RT} hr {
  border: none;
  border-top: var(--rt-hr-w) solid var(--rt-hr-c);
  margin-top: var(--rt-hr-mt);
  margin-bottom: var(--rt-hr-mb);
}
${RT} .button {
  display: inline-block;
  text-decoration: none;
  margin-right: var(--_sizing-button---rich-text--margin-right, ${cssVar("sizing-spacer-gap---padding--small")});
  margin-top: var(--_sizing-button---rich-text--margin-top, ${cssVar("sizing-spacer-gap---padding--medium")});
  margin-bottom: var(--_sizing-button---rich-text--margin-bottom, ${cssVar("sizing-spacer-gap---padding--large")});
}
${RT} h1 { ${face("h1")} font-size: ${t("size", "h1")}; line-height: ${t("height", "h1")}; margin: ${sp("h1-margin-top")} 0 ${sp("h1-margin-bottom")}; }
${RT} h2 { ${face("h2")} font-size: ${t("size", "h2")}; line-height: ${t("height", "h2")}; margin: ${sp("h2-margin-top")} 0 ${sp("h2-margin-bottom")}; }
${RT} h3 { ${face("h3")} font-size: ${t("size", "h3")}; line-height: ${t("height", "h3")}; margin: ${sp("h3-margin-top")} 0 ${sp("h3-margin-bottom")}; }
${RT} h4 { ${face("h4")} font-size: ${t("size", "h4")}; line-height: ${t("height", "h4")}; margin: ${sp("h4-margin-top")} 0 ${sp("h4-margin-bottom")}; }
${RT} h5 { ${face("h5")} font-size: ${t("size", "h5")}; line-height: ${t("height", "h5")}; margin: ${sp("h5-margin-top")} 0 ${sp("h5-margin-bottom")}; }
${RT} h6 { ${face("h6")} font-size: ${t("size", "h6")}; line-height: ${t("height", "h6")}; margin: ${sp("h6-margin-top")} 0 ${sp("h6-margin-bottom")}; }
${RT} p { ${face("p")} font-size: var(--rt-fs, ${t("size", "p")}); line-height: var(--rt-lh, ${t("height", "p")}); margin: ${sp("p-margin-top")} 0 ${sp("p-margin-bottom")}; }
${RT} ul, ${RT} ol {
  ${face("list", "p")}
  font-size: var(--rt-fs, ${t("size", "list")});
  line-height: var(--rt-lh, ${t("height", "list")});
  margin: ${sp("list-margin-top")} 0 ${sp("list-margin-bottom")};
  padding-left: ${sp("list-padding-left")};
}
${RT} blockquote {
  ${face("block-quote")}
  font-size: ${t("size", "block-quote")};
  line-height: ${t("height", "block-quote")};
  margin: ${sp("block-quote-margin-top")} 0 ${sp("block-quote-margin-bottom")};
  padding: ${sp("block-quote-padding-top")} ${sp("block-quote-padding-right")} ${sp("block-quote-padding-bottom")} ${sp("block-quote-padding-left")};
}
${RT} sup { ${face("superscript")} font-size: ${t("size", "superscript")}; line-height: ${t("height", "superscript")}; }
${RT} sub { ${face("subscript")} font-size: ${t("size", "subscript")}; line-height: ${t("height", "subscript")}; bottom: unset; }
${RT} figcaption { ${face("captions")} font-size: ${t("size", "captions")}; line-height: ${t("height", "captions")}; }
`;

const STYLE_ID = "harvey-rich-text";

export function RichText({
  content,
  styleMode = "standard",
  size = "inherit",
  align = "inherit",
  colour = "inherit",
}: RichTextProps) {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = RT_CSS;
    document.head.appendChild(el);
  }, []);
  const suffix = styleMode === "article" ? "-article" : "";
  const sized = size === "inherit" ? undefined : typeSize(size);
  const style = {
    ...(sized ? { "--rt-fs": sized.fontSize, "--rt-lh": sized.lineHeight } : {}),
    textAlign: align === "inherit" ? undefined : tokenValue("textAlign", align),
    color: tokenValue("colour", colour), // undefined for inherit
    "--rt-hr-w": cssVar(`sizing-border-corner---border--hr${suffix}`),
    "--rt-hr-c": cssVar(`colour-semantic---border--hr${suffix}`),
    "--rt-hr-mt": cssVar(`sizing-spacer-gap---padding--hr-top${suffix}`),
    "--rt-hr-mb": cssVar(`sizing-spacer-gap---padding--hr-bottom${suffix}`),
  } as CSSProperties;
  return (
    <div className="rt" style={style}>
      <div className="w-richtext" slot="content">
        {content}
      </div>
    </div>
  );
}
