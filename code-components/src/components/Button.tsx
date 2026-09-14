import type { CSSProperties, ReactNode } from "react";
import { cssVar, tokenValue, type CornersOption } from "@/src/tokens";
import { Icon } from "./Icon";
import type { GlyphName } from "@/src/icons/glyphs";

/**
 * v3 Button — link with a label and optional icon, coloured by the semantic
 * button layer. Colour semantics VERIFIED against the v2 stylesheet
 * (playground embed, 2026-09-14):
 * - every style family carries a 1px border (filled ones in the bg colour),
 *   so outline↔fill hovers never shift layout;
 * - colour-N fills, hover swaps to the hover pair;
 * - outline-N is transparent with bg-coloured ink/border, fills on hover;
 * - outline-no-fill-N never fills — hover shifts ink/border to hover-bg;
 * - hover-N starts in the hover pair and swaps back on hover;
 * - text-N has no border and NO side padding; hover shifts ink to hover-bg.
 */
export const BUTTON_SIZE_OPTIONS = [
  "standard",
  "xshort-narrow",
  "short-narrow",
  "short",
  "wider",
  "no-side-padding",
  "no-padding",
] as const;
export type ButtonSize = (typeof BUTTON_SIZE_OPTIONS)[number];

/* Literal paddings, verified from the v2 stylesheet. */
export const SIZE_PADDING: Record<ButtonSize, string> = {
  standard: ".75rem 1.5rem",
  "xshort-narrow": ".25rem .75rem",
  "short-narrow": ".5rem 1rem",
  short: ".5rem 1.5rem",
  wider: ".75rem 2.5rem",
  "no-side-padding": ".75rem 0",
  "no-padding": "0",
};

/* The 44-option colour vocabulary, generated so it can't drift. */
const N10 = Array.from({ length: 10 }, (_, i) => i + 1);
export const BUTTON_COLOUR_OPTIONS = [
  "standard",
  ...N10.map((n) => `colour-${n}`),
  ...N10.map((n) => `outline-${n}`),
  ...[1, 2, 3].map((n) => `outline-no-fill-${n}`),
  ...N10.map((n) => `hover-${n}`),
  ...N10.map((n) => `text-${n}`),
];
export type ButtonColour = string;

const sb = (group: string, key: string) =>
  cssVar(`colour-semantic-button---${group}--${key}`);

/** Colour option → the group's four custom properties (v2's --btn-* set). */
export function buttonColourVars(option: string): Record<string, string> {
  const m = option.match(/(\d+)$/);
  const group = option === "standard" || !m ? "standard" : `button-${m[1]}`;
  return {
    "--btn-bg": sb(group, "background"),
    "--btn-fg": sb(group, "text"),
    "--btn-hbg": sb(group, "hover-background"),
    "--btn-hfg": sb(group, "hover-text"),
  };
}

/** Colour option → its style-family class. */
export function buttonFamilyClass(option: string): string {
  if (option.includes("no-fill")) return "btn-nofill";
  if (option.startsWith("outline-")) return "btn-outline";
  if (option.startsWith("hover-")) return "btn-hstart";
  if (option.startsWith("text-")) return "btn-text";
  return "btn-fill"; // standard + colour-N
}

/* Resting rules shared with Tag (which has no hover states). */
export const BUTTON_RESTING_CSS = `
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--btn-gap);
  width: fit-content;
  text-decoration: none;
  border-radius: var(--btn-r);
  padding: var(--btn-p);
}
.btn-fill { background: var(--btn-bg); color: var(--btn-fg); border: 1px solid var(--btn-bg); }
.btn-outline, .btn-nofill { background: transparent; color: var(--btn-bg); border: 1px solid var(--btn-bg); }
.btn-hstart { background: var(--btn-hbg); color: var(--btn-hfg); border: 1px solid var(--btn-hbg); }
.btn-text { background: transparent; color: var(--btn-bg); border: none; padding-left: 0; padding-right: 0; }
`;

const BUTTON_CSS = `
${BUTTON_RESTING_CSS}
.btn { cursor: pointer; }
.btn-fill:hover { background: var(--btn-hbg); color: var(--btn-hfg); border-color: var(--btn-hbg); }
.btn-outline:hover { background: var(--btn-bg); color: var(--btn-fg); }
.btn-nofill:hover { color: var(--btn-hbg); border-color: var(--btn-hbg); }
.btn-hstart:hover { background: var(--btn-bg); color: var(--btn-fg); border-color: var(--btn-bg); }
.btn-text:hover { color: var(--btn-hbg); }
/* Page CSS can't reach into the shadow root, so the keyboard focus ring
   lives here (v1 framework's focus style, ported). */
.btn:focus-visible { outline: 0.125rem solid currentColor; outline-offset: 0.125rem; }
`;

export type ButtonProps = {
  text?: ReactNode;
  link?: { href: string; target?: string };
  colour?: ButtonColour;
  size?: ButtonSize;
  corners?: CornersOption;
  showIcon?: boolean;
  icon?: GlyphName;
};

export function Button({
  text = "Button",
  link,
  colour = "standard",
  size = "standard",
  corners = "button",
  showIcon = true,
  icon = "arrow-stem-up-right",
}: ButtonProps) {
  const style = {
    ...buttonColourVars(colour),
    "--btn-p": SIZE_PADDING[size],
    "--btn-r": tokenValue("corners", corners),
    "--btn-gap": cssVar("sizing-spacer-gap---gap--icon-base"),
  } as CSSProperties;
  return (
    <a
      className={`btn ${buttonFamilyClass(colour)}`}
      href={link?.href ?? "#"}
      target={link?.target}
      style={style}
    >
      <style>{BUTTON_CSS}</style>
      <span>{text}</span>
      {showIcon && <Icon glyph={icon} />}
    </a>
  );
}
