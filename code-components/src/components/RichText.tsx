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
 * (user 2026-09-13): `standard` uses the plain font-rich-text/hr variables,
 * `article` swaps every one for its -article counterpart. Content rules carry
 * the v1 baseline: first/last margin trim, links in currentColor, hr from
 * variables, buttons-in-content spacing — plus (2026-09-20) the full per-tag
 * typography and spacing from the font-rich-text variable system
 * (fonts/rich-text.css), since the site's rich text classes can't reach into
 * the shadow root. The Size prop overrides body text (p/lists) only —
 * headings etc. always follow their tag variables, as in v1.
 */
export type RichTextStyle = "standard" | "article";

/* The tag table behind the generated rules. Slugs are the variable names in
   fonts/rich-text.css verbatim; `family` is the slug whose FAMILY variable
   the tag uses (lists have no family variable in v1, so they borrow p's);
   false = don't set. `margins` = has spacing--<slug>-margin-* vars.
   `fallback` (user ruling 2026-09-20): the slug whose variables are the
   LAST resort in every chain — lists/blockquote follow p wherever a site
   doesn't define their own vars. */
type RtTag = {
  sels: string[];
  slug: string;
  family: string | false;
  margins: boolean;
  body?: boolean;
  fallback?: string;
};
const RT_TAGS: RtTag[] = [
  { sels: ["h1"], slug: "h1", family: "h1", margins: true },
  { sels: ["h2"], slug: "h2", family: "h2", margins: true },
  { sels: ["h3"], slug: "h3", family: "h3", margins: true },
  { sels: ["h4"], slug: "h4", family: "h4", margins: true },
  { sels: ["h5"], slug: "h5", family: "h5", margins: true },
  { sels: ["h6"], slug: "h6", family: "h6", margins: true },
  { sels: ["p"], slug: "p", family: "p", margins: true, body: true },
  { sels: ["ul", "ol"], slug: "list", family: "p", margins: true, body: true, fallback: "p" },
  { sels: ["blockquote"], slug: "block-quote", family: "block-quote", margins: true, fallback: "p" },
  { sels: ["sup"], slug: "superscript", family: "superscript", margins: false },
  { sels: ["sub"], slug: "subscript", family: "subscript", margins: false },
  { sels: ["figcaption"], slug: "captions", family: "captions", margins: false },
];

function rtTagCss(suffix: "" | "-article"): string {
  return RT_TAGS.map((t) => {
    const sel = t.sels.map((s) => `.rt ${s}`).join(", ");
    // Own variable first; if the row has a fallback slug, its variables are
    // the last resort in the chain (own site → own lib → p site → p lib).
    const chain = (path: (slug: string) => string) =>
      t.fallback && t.fallback !== t.slug
        ? cssVar(path(t.slug), cssVar(path(t.fallback)))
        : cssVar(path(t.slug));
    const v = (part: string) => chain((slug) => `font-rich-text---${part}--tag--${slug}${suffix}`);
    const sp = (prop: string) => cssVar(`font-rich-text---spacing--${t.slug}${suffix}-${prop}`);
    const spm = (prop: string) => chain((slug) => `font-rich-text---spacing--${slug}${suffix}-${prop}`);
    const lines = [
      ...(t.family
        ? [
            `font-family: ${
              t.family === t.slug
                ? v("family")
                : cssVar(`font-rich-text---family--tag--${t.family}${suffix}`)
            };`,
          ]
        : []),
      // Body tags respect the Size prop (--rt-fs/--rt-lh, set only when
      // Size ≠ inherit); headings and the rest always follow their variables.
      `font-size: ${t.body ? `var(--rt-fs, ${v("size")})` : v("size")};`,
      `line-height: ${t.body ? `var(--rt-lh, ${v("height")})` : v("height")};`,
      `font-weight: ${v("weight")};`,
      `letter-spacing: ${v("letter-spacing")};`,
      ...(t.margins ? ["margin: 0;", `margin-top: ${spm("margin-top")};`, `margin-bottom: ${spm("margin-bottom")};`] : []),
      ...(t.slug === "list" ? [`padding-left: ${sp("padding-left")};`] : []),
      ...(t.slug === "block-quote"
        ? [`padding: ${sp("padding-top")} ${sp("padding-right")} ${sp("padding-bottom")} ${sp("padding-left")};`]
        : []),
    ];
    return `${sel} {\n  ${lines.join("\n  ")}\n}`;
  }).join("\n");
}

const RT_TYPE_CSS: Record<RichTextStyle, string> = {
  standard: rtTagCss(""),
  article: rtTagCss("-article"),
};

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
    // Size ≠ inherit overrides BODY text only (p/lists, via --rt-fs/--rt-lh);
    // headings and the rest always follow their font-rich-text tag variables.
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
      <style>
        {RT_CSS}
        {RT_TYPE_CSS[styleMode]}
      </style>
      {content}
    </div>
  );
}
