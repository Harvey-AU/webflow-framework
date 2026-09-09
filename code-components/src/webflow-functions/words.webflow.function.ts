import { declareFunction, type FunctionContext } from "@webflow/functions";
import { field, liveItems } from "@/src/lib/webflow-cms";
import {
  buildThemeTree,
  groupByTag,
  resourceIndex,
  themeIndex,
} from "@/src/lib/catalog-join";
import type {
  CatalogData,
  Entry,
  EntryDetail,
  EntryResource,
  ThemeRef,
} from "@/src/lib/catalog-types";

/**
 * The word catalog's data, from the `Words` and `Themes` collections.
 *
 * Replaces the dataset that used to be compiled into the bundle. Runs
 * server-side with the site token from `ctx.env`; `WordCatalog` reads it
 * through `useSuspenseData` so the words are in the prerendered HTML, which
 * matters for a dictionary that should be indexable rather than JS-gated.
 */

export default declareFunction(async (ctx: FunctionContext): Promise<CatalogData> => {
  const [wordItems, themeItems, resourceItems, typeItems] = await Promise.all([
    liveItems(ctx.env, "words"),
    liveItems(ctx.env, "themes"),
    liveItems(ctx.env, "resources"),
    liveItems(ctx.env, "resource-types"),
  ]);

  const { bySlug, byId } = themeIndex(themeItems);
  const themeRef = (id: string): ThemeRef | null => {
    const slug = byId.get(id);
    if (!slug) return null;
    return { id: slug, label: bySlug.get(slug)?.label ?? slug };
  };
  const resources = resourceIndex(resourceItems, typeItems, themeRef);

  // Item and entry stay paired: filtering a flat entries[] and then indexing it
  // by wordItems position would misalign every reference after the first skip.
  const pairs = wordItems
    .map((item) => {
      const d = item.fieldData;
      const entry: Entry = {
        slug: field.text(d, "slug"),
        word: field.text(d, "name"),
        gloss: field.text(d, "english-name"),
        scientific: field.text(d, "scientific-name"),
        image: field.imageUrl(d, "image"),
        audio: field.link(d, "pronunciation-audio-2"),
        definition: field.text(d, "definition"),
        examples: field.text(d, "examples"),
        themes: field
          .refs(d, "classifiers")
          .map((id) => byId.get(id))
          .filter((slug): slug is string => Boolean(slug)),
      };
      return { item, entry };
    })
    .filter(({ entry }) => entry.slug && entry.word);

  const entries: Entry[] = pairs.map(({ entry }) => entry);

  // Keyed by CMS id so related-words resolves against every entry: a word can
  // point at one that appears later in the list.
  const entryByItemId = new Map(pairs.map(({ item, entry }) => [item.id, entry] as const));

  const details: Record<string, EntryDetail> = {};
  pairs.forEach(({ item, entry }) => {
    const d = item.fieldData;
    details[entry.slug] = {
      ...entry,
      themeRefs: field
        .refs(d, "classifiers")
        .map(themeRef)
        .filter((t): t is ThemeRef => Boolean(t)),
      resources: field
        .refs(d, "external-links")
        .map((id) => resources.get(id))
        .filter((r): r is EntryResource => Boolean(r)),
      relatedWords: field
        .refs(d, "related-words")
        .map((id) => entryByItemId.get(id))
        .filter((e): e is Entry => Boolean(e))
        .map(({ slug, word, gloss }) => ({ slug, word, gloss })),
    };
  });

  // Collection -> its items -> the collections tagged on each item.
  const themeGroups = groupByTag(
    Object.values(details),
    (slug) => bySlug.get(slug)?.label ?? slug,
    [...bySlug.keys()],
  );

  const used = new Set(entries.flatMap((e) => e.themes));
  return { entries, themeTree: buildThemeTree(themeItems, used), details, themeGroups };
});
