import type { CSSProperties } from "react";
import { tokenValue, type CornersOption } from "@/src/tokens";

/**
 * v3 Image. Surface decided 2026-09-13: no Alt prop (alt rides on the asset
 * through the Image prop value — VERIFY on canvas that it actually arrives;
 * if not, that's an accessibility hole to raise). Image mobile swaps the
 * asset ≤767 via <picture>. Custom style is the re-admitted escape hatch —
 * any override used twice graduates to a real prop.
 */
export const RATIO_OPTIONS = ["auto", "1x1", "3x2", "4x3", "16x9", "2x1", "fill"] as const;
export type RatioOption = (typeof RATIO_OPTIONS)[number];

const RATIOS: Record<string, string | undefined> = {
  auto: undefined,
  "1x1": "1 / 1",
  "3x2": "3 / 2",
  "4x3": "4 / 3",
  "16x9": "16 / 9",
  "2x1": "2 / 1",
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
  align?: ImageAlign;
  loading?: ImageLoading;
  customStyle?: string;
};

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
  align = "center",
  loading = "lazy",
  customStyle = "",
}: ImageProps) {
  if (!image?.src) return null;
  const style: CSSProperties = {
    display: "block",
    width: "100%",
    height: ratio === "fill" ? "100%" : "auto",
    aspectRatio: RATIOS[ratio],
    objectFit: fit,
    borderRadius: tokenValue("corners", corners),
    maxWidth: maxWidth === "100" ? undefined : `${maxWidth}%`,
    marginLeft: align === "left" ? 0 : "auto",
    marginRight: align === "right" ? 0 : "auto",
    ...parseCustomStyle(customStyle),
  };
  const img = <img src={image.src} alt={image.alt ?? ""} loading={loading} style={style} />;
  if (!imageMobile?.src) return img;
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={imageMobile.src} />
      {img}
    </picture>
  );
}
