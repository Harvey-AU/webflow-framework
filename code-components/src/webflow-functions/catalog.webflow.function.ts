import { declareFunction, type FunctionContext } from "@webflow/functions";
import { createWebflowClient } from "@/src/lib/cms/webflow";
import { catalogQuery } from "@/src/lib/queries";
import type { CatalogData } from "@/src/lib/catalog-types";

/**
 * Exposes `catalogQuery` to the page.
 *
 * Runs server-side with the site token from `ctx.env`, and the catalog's call
 * site reads it through `useSuspenseData`, so the words are in the prerendered
 * HTML rather than fetched after hydration. That matters for a dictionary,
 * which should be indexable.
 */
export default declareFunction(
  async (ctx: FunctionContext): Promise<CatalogData> => catalogQuery(createWebflowClient(ctx.env)),
);
