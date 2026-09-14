/**
 * The catalog's fallback content, compiled into the bundle.
 *
 * TEMPORARY. The catalog is meant to render the Webflow CMS through
 * `catalogQuery`, and it will the moment Code Functions can be deployed. Today
 * they cannot: the stable CLI stubs them out of the bundle and the prerelease
 * CLI cannot upload at all, so `useQuery` falls back, and an empty fallback
 * renders a filter panel with nothing behind it and every facet count at zero.
 *
 * To remove: once a function deploys, point `WordCatalog.webflow.tsx` back at
 * `EMPTY_CATALOG` and delete this file. Nothing else imports the dataset.
 *
 * The words themselves are the community's own, from the sources named at the
 * top of `src/data/words.ts`. The `themes` on them are derived by keyword, not
 * authored, and that file says so: not authoritative Kaytetye classification.
 */

import type { CatalogData, Entry } from "@/src/lib/catalog-types";
import { ENTRIES, THEME_TREE } from "@/src/data/words";

/**
 * The source file keeps the two community sources apart (a 1997 definition and
 * a recorded story are different things); the catalog only needs "some prose"
 * and "an example", so the mapping happens here rather than in a component.
 */
const entries: Entry[] = ENTRIES.map((e) => ({
  slug: e.slug,
  word: e.word,
  gloss: e.gloss,
  scientific: e.scientific,
  image: e.image,
  audio: e.audio,
  definition: e.defEnglish || e.defKaytetye,
  examples: e.storyEnglish || e.storyKaytetye,
  themes: e.themes,
}));

export const FALLBACK_CATALOG: CatalogData = {
  entries,
  themeTree: THEME_TREE,
  // Only the grid and filters have a fallback. The detail-level joins are the
  // part that genuinely needs the CMS, so they stay empty rather than being
  // half-populated from a file.
  details: {},
  themeGroups: [],
};
