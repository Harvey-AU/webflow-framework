/**
 * The CMS layer.
 *
 * `types` is the port every query is written against, `webflow` and `static`
 * are the adapters that satisfy it, `fields` reads the values on a record.
 * Nothing above this folder should import an adapter except the place that
 * constructs the client, which is a Code Function.
 */
export type { CmsClient, CmsRecord } from "./types";
export { field } from "./fields";
export { createWebflowClient, type WebflowCmsEnv } from "./webflow";
export { createStaticClient } from "./static";
