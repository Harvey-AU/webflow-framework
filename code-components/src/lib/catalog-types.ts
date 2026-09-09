/**
 * Shapes shared by the catalog components and the Code Functions that feed
 * them.
 *
 * This module holds no data. It exists so a component can describe what it
 * renders without importing a dataset: everything the catalog shows now comes
 * from the Webflow CMS through `words.webflow.function.ts`.
 */

/** One word, as the grid and filters need it. Mirrors the `Words` collection. */
export type Entry = {
  slug: string;
  word: string;
  gloss: string;
  scientific: string;
  image: string | null;
  audio: string | null;
  /** Rich text from the CMS. Searched as plain text, not rendered here. */
  definition: string;
  /** Rich text from the CMS. Presence of this is the "has a story" facet. */
  examples: string;
  /** Theme slugs, from the item's Classifiers reference field. */
  themes: string[];
};

/** A node in the Themes tree, built from the collection's Parent theme field. */
export type ThemeNode = {
  id: string;
  label: string;
  children?: ThemeNode[];
};

export type MediaFilter = "photo" | "audio" | "story";

export const MEDIA_FACETS: { id: MediaFilter; label: string }[] = [
  { id: "photo", label: "Has a photo" },
  { id: "audio", label: "Has a recording" },
  { id: "story", label: "Has a story" },
];

export type SortKey = "word" | "gloss" | "photos";

export const SORTS: { id: SortKey; label: string }[] = [
  { id: "photos", label: "Photos first" },
  { id: "word", label: "Kaytetye A–Z" },
  { id: "gloss", label: "English A–Z" },
];

/** What `words.webflow.function.ts` resolves to. */
export type CatalogData = {
  entries: Entry[];
  themeTree: ThemeNode[];
};
