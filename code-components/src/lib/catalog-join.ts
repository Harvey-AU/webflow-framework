/**
 * The joins behind the catalog, with no Webflow runtime dependency.
 *
 * Kept out of the function file so the reverse lookups can be exercised
 * directly: see catalog-join.test.ts. Collection Lists can only traverse a
 * reference forwards, so the grouping here (a parent, then every child tagged
 * with it) is the part that has no native equivalent.
 */
import { field } from "./cms/fields";
import type { CmsRecord } from "./cms/types";
import type {
  Entry,
  EntryDetail,
  EntryResource,
  ThemeGroup,
  ThemeNode,
  ThemeRef,
} from "./catalog-types";

/** Themes, keyed by id, so Words can resolve its Classifiers references. */
function themeIndex(items: CmsRecord[]) {
  const bySlug = new Map<string, { slug: string; label: string; parent: string | null }>();
  const byId = new Map<string, string>();

  for (const item of items) {
    const slug = field.text(item.fields, "slug");
    if (!slug) continue;
    byId.set(item.id, slug);
    bySlug.set(slug, {
      slug,
      label: field.text(item.fields, "name"),
      parent: field.ref(item.fields, "parent-theme"),
    });
  }
  return { bySlug, byId };
}

/**
 * Build the filter tree from Parent theme references.
 *
 * The panel shows two levels, so the top-level Theme ("Apmere (Country)") is
 * skipped and its Categories become the roots - matching the Filter by design.
 * Branches with no words behind them are dropped rather than rendered as
 * checkboxes that can only ever return nothing.
 */
function buildThemeTree(items: CmsRecord[], used: Set<string>): ThemeNode[] {
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
      // Parent is the top-level Theme, so this is a Category, so it is a root.
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
  resourceItems: CmsRecord[],
  typeItems: CmsRecord[],
  themeLabel: (id: string) => ThemeRef | null,
): Map<string, EntryResource> {
  const typeName = new Map(
    typeItems.map((t) => [t.id, field.text(t.fields, "name")] as const),
  );

  return new Map(
    resourceItems.map((item) => {
      const d = item.fields;
      const typeId = field.ref(d, "resource-type");
      const resource: EntryResource = {
        slug: field.text(d, "slug"),
        name: field.text(d, "name"),
        description: field.text(d, "description"),
        type: typeId ? (typeName.get(typeId) ?? null) : null,
        readTime: field.number(d, "read-time"),
        link: field.url(d, "link"),
        image: field.url(d, "image"),
        topicTags: field
          .refs(d, "topic-tags")
          .map(themeLabel)
          .filter((t): t is ThemeRef => Boolean(t)),
      };
      return [item.id, resource] as const;
    }),
  );
}

/**
 * Group a parent collection by the children that reference it.
 *
 * This is the reverse of what a Collection List can do. Themes carry no field
 * pointing at Words; each Word points at its Themes. Inverting that in memory
 * costs one pass, and there is no per-row request and no item cap.
 */
export function groupByTag(
  details: EntryDetail[],
  label: (slug: string) => string,
  tagSlugs: string[],
): ThemeGroup[] {
  const out: ThemeGroup[] = [];
  for (const slug of [...tagSlugs].sort()) {
    const words = details
      .filter((e) => e.themes.includes(slug))
      .sort((a, b) => a.word.localeCompare(b.word, "en"));
    if (!words.length) continue;
    out.push({ theme: { id: slug, label: label(slug) }, words });
  }
  return out;
}

export { themeIndex, buildThemeTree, resourceIndex };
