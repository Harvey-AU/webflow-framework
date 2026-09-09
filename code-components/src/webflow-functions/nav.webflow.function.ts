import { declareFunction, type FunctionContext } from "@webflow/functions";
import { createWebflowClient } from "@/src/lib/cms/webflow";
import { navQuery, type NavData } from "@/src/lib/queries";

/**
 * Exposes `navQuery` to the page.
 *
 * All a function does is pick the client and run a query: the query holds the
 * collection slugs, the client holds the credentials, this file holds neither.
 * Point it at a different CMS by constructing a different client here.
 */
export default declareFunction(
  async (ctx: FunctionContext): Promise<NavData> => navQuery(createWebflowClient(ctx.env)),
);
