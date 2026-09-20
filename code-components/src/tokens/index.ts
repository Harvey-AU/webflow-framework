import raw from "./tokens.json";

/**
 * Design-token vocabulary for v3 code components.
 *
 * `tokens.json` is the single source of truth: every scale is an ordered map
 * of option name → variable path or literal. Option names are the Designer
 * dropdown values verbatim (and match the v1/v2 token names, so migration maps
 * by name). Key order in the JSON is the dropdown order — small → large,
 * semantic values after the scale.
 *
 * Provenance: verified against the Component Library site (its carrier
 * components, variables, and the generated attr-v2.css) on 2026-09-11.
 * Literals mark options with no variable behind them, exactly as v2 ships
 * them: padding/spacer `zero` → 0, gutters `none` → 0, corners `circle` →
 * 50%, container `full` → none. Colour `inherit` resolves to undefined —
 * "don't set the property".
 *
 * Not in here (yet): typography. Type sizes pair font-size with line-height
 * (two properties per option) and families/decoration are multi-property, so
 * they get their own shape when Heading/Text is built.
 */

type Scales = typeof raw.scales;
export type Scale = keyof Scales;

/** Option-name union for one scale, e.g. `TokenOption<"padding">`. */
export type TokenOption<S extends Scale> = keyof Scales[S] & string;

export type PaddingOption = TokenOption<"padding">;
export type GapOption = TokenOption<"gap">;
export type SpacerOption = TokenOption<"spacer">;
export type GuttersOption = TokenOption<"gutters">;
export type CornersOption = TokenOption<"corners">;
export type BorderOption = TokenOption<"border">;
export type ContainerWidthOption = TokenOption<"container">;
export type ColumnsOption = TokenOption<"columns">;
export type AlignmentOption = TokenOption<"alignment">;
export type WeightOption = TokenOption<"weight">;
export type TextAlignOption = TokenOption<"textAlign">;
export type ColourOption = TokenOption<"colour">;

type TokenEntry = { path: string } | { literal: string | null };
const scales = raw.scales as Record<Scale, Record<string, TokenEntry>>;
const NS = raw.libraryNamespace;

/**
 * CSS value for one option: the same dual-fallback chain the v2 stylesheet
 * uses — the site's own variable (`--_`) first, the library-namespaced copy
 * second — or the literal. `undefined` means "don't set the property"
 * (colour `inherit`, or an option not in the scale).
 */
export function tokenValue<S extends Scale>(scale: S, option: TokenOption<S>): string | undefined {
  const entry = scales[scale][option];
  if (!entry) return undefined;
  if ("literal" in entry) return entry.literal ?? undefined;
  return `var(--_${entry.path}, var(--${NS}_${entry.path}))`;
}

/** Ordered option names for a scale — feed straight into `props.Variant` options. */
export function tokenOptions<S extends Scale>(scale: S): TokenOption<S>[] {
  return Object.keys(scales[scale]) as TokenOption<S>[];
}

/**
 * Dual-fallback reference for a one-off variable outside the scales
 * (semantic button colours, hr, the icon gap). Only use with paths verified
 * against the site — this bypasses the vocabulary check the scales provide.
 * An optional `fallback` becomes the last resort after both variable forms —
 * for variables that may not exist on older sites yet.
 */
export function cssVar(path: string, fallback?: string): string {
  return fallback === undefined
    ? `var(--_${path}, var(--${NS}_${path}))`
    : `var(--_${path}, var(--${NS}_${path}, ${fallback}))`;
}

/* ---- Typography sizes: the one multi-value scale (font-size + line-height
   + letter-spacing). Every size option pairs all three, per the site's
   --_font---size/--_font---height/--_font---letter-spacing variable sets
   (tag options use the --tag-- spacing variables, scale options the scale
   ones — verified in the framework's fonts/base.css, 2026-09-20).
   "inherit" is handled by callers as "don't set". ---- */

export type TypeSizeOption = keyof typeof raw.typeSizes & string;

const typeSizes = raw.typeSizes as Record<string, { size: string; height: string; spacing: string }>;

/** font-size + line-height + letter-spacing CSS values for a type size option. */
export function typeSize(option: TypeSizeOption): {
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
} {
  const t = typeSizes[option];
  return {
    fontSize: `var(--_${t.size}, var(--${NS}_${t.size}))`,
    lineHeight: `var(--_${t.height}, var(--${NS}_${t.height}))`,
    letterSpacing: `var(--_${t.spacing}, var(--${NS}_${t.spacing}))`,
  };
}

/** Ordered type size options (tag sizes first, then the numeric scale). */
export function typeSizeOptions(): TypeSizeOption[] {
  return Object.keys(typeSizes) as TypeSizeOption[];
}
