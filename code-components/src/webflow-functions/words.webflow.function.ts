import { declareFunction, type FunctionContext } from "@webflow/functions";
import { field, liveItems, type CmsItem } from "@/src/lib/webflow-cms";
import type { CatalogData, Entry, ThemeNode } from "@/src/lib/catalog-types";

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

export default declareFunction(async (ctx: FunctionContext): Promise<CatalogData> => {
  const [wordItems, themeItems] = await Promise.all([
    liveItems(ctx.env, "words"),
    liveItems(ctx.env, "themes"),
  ]);

  const { byId } = themeIndex(themeItems);

  const entries: Entry[] = wordItems
    .map((item) => {
      const d = item.fieldData;
      return {
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
    })
    .filter((e) => e.slug && e.word);

  const used = new Set(entries.flatMap((e) => e.themes));
  return { entries, themeTree: buildThemeTree(themeItems, used) };
});
