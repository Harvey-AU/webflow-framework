import { field } from "../cms/fields";
import type { CmsClient } from "../cms/types";
import type { NavItem } from "@/src/config/site";

export type NavData = { nav: NavItem[] };

/**
 * The header's links, from the `Nav Items` collection.
 *
 * Sorted by the collection's Order field rather than by name, so the running
 * order is editorial and set in Webflow.
 */
export async function navQuery(cms: CmsClient): Promise<NavData> {
  const items = await cms.records("nav-items");

  const nav = items
    .map((item) => ({
      label: field.text(item.fields, "name"),
      href: field.url(item.fields, "link") ?? "",
      order: field.number(item.fields, "order") ?? 0,
      newTab: field.boolean(item.fields, "open-in-new-tab"),
    }))
    // A link with no target would render as a dead nav item, so drop it here
    // rather than letting the header decide what to do with it.
    .filter((n) => n.label && n.href)
    .sort((a, b) => a.order - b.order)
    .map(({ label, href, newTab }): NavItem => ({ label, href, newTab }));

  return { nav };
}
