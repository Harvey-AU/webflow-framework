/**
 * Shapes shared by the catalog components and the Code Functions that feed
 * them.
 *
 * This module holds no data and knows no CMS. It is the contract between a
 * query, which builds these shapes from whatever content source it was handed,
 * and a component, which renders them as props. `queries/catalog.ts` fills them
 * from a `CmsClient`; a test or a local preview can fill them from a file.
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

/** A theme as it appears tagged on a word or a resource. */
export type ThemeRef = {
  id: string;
  label: string;
};

/** A linked resource, with its own type and topic tags resolved. */
export type EntryResource = {
  slug: string;
  name: string;
  description: string;
  /** From the Resource Types collection, e.g. "Audio", "Video", "Art". */
  type: string | null;
  readTime: number | null;
  link: string | null;
  image: string | null;
  topicTags: ThemeRef[];
};

/**
 * One word with every reference resolved, for the detail and theme pages.
 *
 * This is the three-level shape: a theme group holds words, each word holds the
 * themes tagged on it and the resources linked to it, and each resource holds
 * its own type and topic tags.
 */
export type EntryDetail = Entry & {
  /** The word's Classifiers, with labels rather than bare slugs. */
  themeRefs: ThemeRef[];
  resources: EntryResource[];
  relatedWords: { slug: string; word: string; gloss: string }[];
};

/** Words grouped under the theme they are tagged with. */
export type ThemeGroup = {
  theme: ThemeRef;
  words: EntryDetail[];
};

/** What `catalogQuery` resolves to. */
export type CatalogData = {
  entries: Entry[];
  themeTree: ThemeNode[];
  /** Every word with references resolved, keyed by slug. */
  details: Record<string, EntryDetail>;
  /** Classifier-level themes, each with the words tagged under it. */
  themeGroups: ThemeGroup[];
};
