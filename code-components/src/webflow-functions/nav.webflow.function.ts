import { declareFunction, type FunctionContext } from "@webflow/functions";
import { field, liveItems } from "@/src/lib/webflow-cms";
import type { NavItem } from "@/src/config/site";

/**
 * Header navigation, from the `Nav Items` collection.
 *
 * Runs server-side, so the site token stays in `ctx.env`. `SiteHeader` calls
 * this through `useSuspenseData`, which lets the links land in the prerendered
 * HTML instead of appearing after hydration.
 */
export default declareFunction(async (ctx: FunctionContext) => {
  const items = await liveItems(ctx.env, "nav-items");

  const nav: NavItem[] = items
    .map((item) => ({
      label: field.text(item.fieldData, "name"),
      href: field.link(item.fieldData, "link") ?? "",
      order: field.number(item.fieldData, "order") ?? 0,
      newTab: item.fieldData["open-in-new-tab"] === true,
    }))
    // A nav item with no label or no target would render as a dead link.
    .filter((n) => n.label && n.href)
    .sort((a, b) => a.order - b.order)
    .map(({ label, href, newTab }) => ({ label, href, newTab }));

  return { nav };
});
