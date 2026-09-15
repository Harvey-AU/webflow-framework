import type { CSSProperties } from "react";
import { tokenValue, type CornersOption } from "@/src/tokens";

/**
 * v3 Image. Surface decided 2026-09-13: no Alt prop (alt rides on the asset
 * through the Image prop value — VERIFY on canvas that it actually arrives;
 * if not, that's an accessibility hole to raise). Image mobile swaps the
 * asset ≤767 via <picture>. Custom style is the re-admitted escape hatch —
 * any override used twice graduates to a real prop.
 */
export const RATIO_OPTIONS = [
  "auto",
  "1x1",
  "3x2",
  "4x3",
  "5x4",
  "16x9",
  "21x9",
  "2x1",
  "2x3",
  "3x4",
  "4x5",
  "9x16",
  "fill",
] as const;
export type RatioOption = (typeof RATIO_OPTIONS)[number];

const RATIOS: Record<string, string | undefined> = {
  auto: undefined,
  "1x1": "1 / 1",
  "3x2": "3 / 2",
  "4x3": "4 / 3",
  "5x4": "5 / 4",
  "16x9": "16 / 9",
  "21x9": "21 / 9",
  "2x1": "2 / 1",
  "2x3": "2 / 3",
  "3x4": "3 / 4",
  "4x5": "4 / 5",
  "9x16": "9 / 16",
  fill: undefined, // fill = stretch to the parent's height instead
};

export const MAX_WIDTH_OPTIONS = ["25", "33", "50", "66", "75", "90", "100"] as const;
export type MaxWidthOption = (typeof MAX_WIDTH_OPTIONS)[number];

export type ImageFit = "cover" | "contain";
export type ImageLoading = "lazy" | "eager";
export type ImageAlign = "left" | "center" | "right";

export type ImageProps = {
  image?: { src: string; alt?: string };
  imageMobile?: { src: string; alt?: string };
  ratio?: RatioOption;
  fit?: ImageFit;
  corners?: CornersOption;
  maxWidth?: MaxWidthOption;
  /** Fixed pixel width for logos/icons; 0 = fill the container (default). */
  widthPx?: number;
  align?: ImageAlign;
  loading?: ImageLoading;
  customStyle?: string;
};

/**
 * The Designer fills unset Image props with its placeholder asset rather
 * than leaving them empty, so "no mobile override" arrives as placeholder.svg
 * (verified in CAF DOM 2026-09-14). An override only counts when it's a real
 * asset: blank or placeholder both mean "use the main image everywhere".
 */
const WEBFLOW_PLACEHOLDER = /plugins\/Basic\/assets\/placeholder/;

function realSrc(asset?: { src: string }): string | undefined {
  const src = asset?.src;
  if (!src || WEBFLOW_PLACEHOLDER.test(src)) return undefined;
  return src;
}

/** "border-radius: 4px; opacity: .5" → { borderRadius: "4px", opacity: ".5" } */
function parseCustomStyle(input: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const rule of input.split(";")) {
    const i = rule.indexOf(":");
    if (i < 0) continue;
    const prop = rule.slice(0, i).trim();
    const value = rule.slice(i + 1).trim();
    if (!prop || !value) continue;
    const camel = prop.replace(/-+([a-z])/g, (_, c: string) => c.toUpperCase());
    out[camel] = value;
  }
  return out as CSSProperties;
}

export function Image({
  image,
  imageMobile,
  ratio = "auto",
  fit = "cover",
  corners = "none",
  maxWidth = "100",
  widthPx = 0,
  align = "center",
  loading = "lazy",
  customStyle = "",
}: ImageProps) {
  if (!image?.src) return null;
  const style: CSSProperties = {
    display: "block",
    // Full container width by default (a photo in a grid cell); a fixed px
    // width for logos/icons — the gap v1/v2 never closed.
    width: widthPx > 0 ? `${widthPx}px` : "100%",
    height: ratio === "fill" ? "100%" : "auto",
    aspectRatio: RATIOS[ratio],
    objectFit: fit,
    borderRadius: tokenValue("corners", corners),
    // Percentage cap from the Max width option; a fixed px width still gets
    // a 100% cap so it can't overflow a narrow container.
    maxWidth: maxWidth !== "100" ? `${maxWidth}%` : widthPx > 0 ? "100%" : undefined,
    marginLeft: align === "left" ? 0 : "auto",
    marginRight: align === "right" ? 0 : "auto",
    ...parseCustomStyle(customStyle),
  };
  const mobileSrc = realSrc(imageMobile);
  if (!mobileSrc) {
    return <img src={image.src} alt={image.alt ?? ""} loading={loading} style={style} />;
  }
  // Real mobile override: two imgs swapped by a plain media query — the
  // <picture> approach hit a Webflow limitation (reverted 2026-09-15, user).
  // display comes from the classes here, so strip it from the inline style.
  const { display: _display, ...shared } = style;
  return (
    <>
      <style>{IMG_SWAP_CSS}</style>
      <img className="img-d" src={image.src} alt={image.alt ?? ""} loading={loading} style={shared} />
      <img className="img-m" src={mobileSrc} alt={imageMobile?.alt ?? image.alt ?? ""} loading={loading} style={shared} />
    </>
  );
}

const IMG_SWAP_CSS = `
.img-d { display: block; }
.img-m { display: none; }
@media (max-width: 767px) {
  .img-d { display: none; }
  .img-m { display: block; }
}
`;
