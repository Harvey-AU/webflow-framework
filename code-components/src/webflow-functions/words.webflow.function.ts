import { declareFunction, type FunctionContext } from "@webflow/functions";
import { field, liveItems, type CmsItem } from "@/src/lib/webflow-cms";
import type {
  CatalogData,
  Entry,
  EntryDetail,
  EntryResource,
  ThemeGroup,
  ThemeNode,
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

/** Themes, keyed by id, so Words can resolve its Classifiers references. */
function themeIndex(items: CmsItem[]) {
  const bySlug = new Map<string, { slug: string; label: string; parent: string | null }>();
  const byId = new Map<string, string>();

  for (const item of items) {
    const slug = field.text(item.fieldData, "slug");
    if (!slug) continue;
    byId.set(item.id, slug);
    bySlug.set(slug, {
      slug,
      label: field.text(item.fieldData, "name"),
      parent: field.ref(item.fieldData, "parent-theme"),
    });
  }
  return { bySlug, byId };
}

/**
 * Build the filter tree from Parent theme references.
 *
 * The panel shows two levels, so the top-level Theme ("Apmere (Country)") is
 * skipped and its Categories become the roots — matching the Filter by design.
 * Branches with no words behind them are dropped rather than rendered as
 * checkboxes that can only ever return nothing.
 */
function buildThemeTree(items: CmsItem[], used: Set<string>): ThemeNode[] {
  const { bySlug, byId } = themeIndex(items);
  const parentSlug = (slug: string) => {
    const parentId = bySlug.get(slug)?.parent;
    return parentId ? (byId.get(parentId) ?? null) : null;
  };

  const roots: ThemeNode[] = [];
  const rootIndex = new Map<string, ThemeNode>();

  const ensureRoot = (slug: string): ThemeNode => {
    let node = rootIndex.get(slug);
    if (!node) {
      node = { id: slug, label: bySlug.get(slug)?.label ?? slug, children: [] };
      rootIndex.set(slug, node);
      roots.push(node);
    }
    return node;
  };

  for (const slug of [...bySlug.keys()].sort()) {
    if (!used.has(slug)) continue;
    const parent = parentSlug(slug);
    // No parent at all is the single top-level Theme; the panel starts a level down.
    if (!parent) continue;
    const grandparent = parentSlug(parent);
    if (!grandparent) {
      // Parent is the top-level Theme, so this is a Category: it is a root.
      ensureRoot(slug);
    } else {
      ensureRoot(parent).children!.push({
        id: slug,
        label: bySlug.get(slug)?.label ?? slug,
      });
    }
  }

  for (const node of roots) {
    node.children!.sort((a, b) => a.label.localeCompare(b.label, "en"));
    if (!node.children!.length) delete node.children;
  }
  return roots.sort((a, b) => a.label.localeCompare(b.label, "en"));
}

/**
 * Resources with their own references resolved.
 *
 * This is the third level: a word links to resources, and each resource carries
 * a Resource Type and its own Topic tags into Themes. Nested Collection Lists
 * would need a request per row here; indexing each collection once means depth
 * costs nothing.
 */
function resourceIndex(
  resourceItems: CmsItem[],
  typeItems: CmsItem[],
  themeLabel: (id: string) => ThemeRef | null,
): Map<string, EntryResource> {
  const typeName = new Map(
    typeItems.map((t) => [t.id, field.text(t.fieldData, "name")] as const),
  );

  return new Map(
    resourceItems.map((item) => {
      const d = item.fieldData;
      const typeId = field.ref(d, "resource-type");
      const resource: EntryResource = {
        slug: field.text(d, "slug"),
        name: field.text(d, "name"),
        description: field.text(d, "description"),
        type: typeId ? (typeName.get(typeId) ?? null) : null,
        readTime: field.number(d, "read-time"),
        link: field.link(d, "link"),
        image: field.imageUrl(d, "image"),
        topicTags: field
          .refs(d, "topic-tags")
          .map(themeLabel)
          .filter((t): t is ThemeRef => Boolean(t)),
      };
      return [item.id, resource] as const;
    }),
  );
}

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

  // Collection -> its items -> the collections tagged on each item. Grouped by
  // classifier, which is the level the Theme Collection page renders.
  const themeGroups: ThemeGroup[] = [];
  for (const slug of [...bySlug.keys()].sort()) {
    const words = Object.values(details).filter((e) => e.themes.includes(slug));
    if (!words.length) continue;
    themeGroups.push({
      theme: { id: slug, label: bySlug.get(slug)?.label ?? slug },
      words: words.sort((a, b) => a.word.localeCompare(b.word, "en")),
    });
  }

  const used = new Set(entries.flatMap((e) => e.themes));
  return { entries, themeTree: buildThemeTree(themeItems, used), details, themeGroups };
});
