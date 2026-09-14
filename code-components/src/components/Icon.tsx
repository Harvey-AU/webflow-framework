import type { CSSProperties } from "react";
import { GLYPHS, type GlyphName } from "@/src/icons/glyphs";
import { tokenValue, type ColourOption } from "@/src/tokens";

/**
 * v3 Icon — inline SVG glyphs extracted from the v1 masks (all 49; names are
 * the stable API). Most glyphs are stroke-based, so Weight overrides
 * stroke-width; the fill-only ones (triangles, dot, plus, quote, the content
 * icons…) ignore it, as documented in glyphs.ts.
 *
 * Sizes are em-based so icons track the surrounding text, matching v1's
 * 1.35em element height for `inherit`.
 */
export const ICON_SIZE_OPTIONS = ["inherit", "small", "medium", "large", "xlarge"] as const;
export type IconSize = (typeof ICON_SIZE_OPTIONS)[number];

const SIZES: Record<IconSize, string> = {
  inherit: "1.35em", // v1's --icon_element-height
  small: "1em",
  medium: "1.5em",
  large: "2em",
  xlarge: "3em",
};

export type IconProps = {
  glyph?: GlyphName;
  size?: IconSize;
  colour?: ColourOption;
  /** stroke-width override; 1.25 is the v1 default drawn into the SVGs */
  weight?: number;
};

const ICON_CSS = `
.icn { display: inline-block; height: var(--icn-h); vertical-align: middle; line-height: 0; }
.icn svg { height: 100%; width: auto; display: inline; }
.icn svg * { stroke-width: var(--icn-sw, 1.25); }
`;

export function Icon({
  glyph = "arrow-stem-right",
  size = "inherit",
  colour = "inherit",
  weight = 1.25,
}: IconProps) {
  const entry = GLYPHS[glyph];
  if (!entry) return null;
  const style = {
    "--icn-h": SIZES[size],
    "--icn-sw": String(weight),
    color: tokenValue("colour", colour), // undefined for inherit → currentColor
  } as CSSProperties;
  return (
    <>
      <style>{ICON_CSS}</style>
      {/* Safe innerHTML: entry.svg is static build-time output of
          scripts/extract-icons.mjs from our own repo — glyph is a keyof
          union, so no runtime/user content can ever reach this sink. */}
      <span
        className="icn"
        style={style}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: entry.svg }}
      />
    </>
  );
}
