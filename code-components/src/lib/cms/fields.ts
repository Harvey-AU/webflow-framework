/**
 * Readers for the values on a `CmsRecord`.
 *
 * Every field read in a query goes through one of these rather than indexing
 * `fields` directly: an absent field, an empty one and a wrongly typed one all
 * have to collapse to something renderable, and no CMS is consistent about
 * which of `null`, `""` and "key missing" it returns.
 */
import type { CmsRecord } from "./types";

type Fields = CmsRecord["fields"];

export const field = {
  /** Always a string, so a heading never renders "undefined". */
  text(fields: Fields, key: string): string {
    const v = fields[key];
    return typeof v === "string" ? v : "";
  },
  /**
   * A URL, or null when there isn't one.
   *
   * Covers links, images, files and audio: an adapter flattens whatever wrapper
   * its source uses down to the URL string before a query sees it.
   */
  url(fields: Fields, key: string): string | null {
    const v = fields[key];
    return typeof v === "string" && v ? v : null;
  },
  number(fields: Fields, key: string): number | null {
    const v = fields[key];
    return typeof v === "number" ? v : null;
  },
  /** Absent is false: an unticked switch and a missing field mean the same. */
  boolean(fields: Fields, key: string): boolean {
    return fields[key] === true;
  },
  /**
   * Record ids from a reference field, single or multi.
   *
   * Both collapse to an array so a query can traverse them the same way, which
   * matters because a field can change from single to multi in the CMS without
   * the code that reads it changing.
   */
  refs(fields: Fields, key: string): string[] {
    const v = fields[key];
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
    return typeof v === "string" && v ? [v] : [];
  },
  ref(fields: Fields, key: string): string | null {
    const v = fields[key];
    return typeof v === "string" && v ? v : null;
  },
};
