import type { CSSProperties } from "react";
import { cssVar } from "@/src/tokens";

/**
 * Shared typography machinery for Heading / Text.
 *
 * Decoration uses native text-decoration with the underline size/gap
 * variables (offset = -gap), exactly as v2's final stylesheet does —
 * VERIFIED against the v2 playground embed 2026-09-14. (v1's ::after bar
 * approach was superseded; native decoration survives line wraps.)
 */
export const DECORATION_OPTIONS = [
  "none",
  "underline-1",
  "underline-2",
  "underline-3",
  "strike-through",
] as const;
export type DecorationOption = (typeof DECORATION_OPTIONS)[number];

/** Static rules shared by every text-bearing component. */
export const TYPE_CSS = `
.t { margin: 0; }
`;

/** Inline styles for a decoration option; undefined for "none". */
export function decorationStyle(d: DecorationOption): CSSProperties | undefined {
  if (d === "none") return undefined;
  if (d === "strike-through") return { textDecorationLine: "line-through" };
  const n = d.slice("underline-".length);
  return {
    textDecorationLine: "underline",
    textDecorationThickness: cssVar(`font---underline--${n}-size`),
    textUnderlineOffset: `calc(-1 * ${cssVar(`font---underline--${n}-gap`)})`,
  };
}
