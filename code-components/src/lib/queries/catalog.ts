import { field } from "../cms/fields";
import type { CmsClient } from "../cms/types";
import { buildThemeTree, groupByTag, resourceIndex, themeIndex } from "../catalog-join";
import type {
  CatalogData,
  Entry,
  EntryDetail,
  EntryResource,
  ThemeRef,
} from "../catalog-types";

/**
 * The word catalog, from the `Words`, `Themes`, `Resources` and
 * `Resource Types` collections.
 *
 * Four reads in parallel and then every reference resolved in memory. This is
 * the whole reason the catalog is a code component: the shape it returns is
 * three levels deep - a theme holds words, a word holds the themes tagged on it
 * and the resources linked to it, a resource holds its own type and tags - and
 * the middle level is a reverse lookup a Collection List cannot express.
 */
export async function catalogQuery(cms: CmsClient): Promise<CatalogData> {
  const [wordItems, themeItems, resourceItems, typeItems] = await Promise.all([
    cms.records("words"),
    cms.records("themes"),
    cms.records("resources"),
    cms.records("resource-types"),
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
      const d = item.fields;
      const entry: Entry = {
        slug: field.text(d, "slug"),
        word: field.text(d, "name"),
        gloss: field.text(d, "english-name"),
        scientific: field.text(d, "scientific-name"),
        image: field.url(d, "image"),
        audio: field.url(d, "pronunciation-audio-2"),
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
    const d = item.fields;
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
}
