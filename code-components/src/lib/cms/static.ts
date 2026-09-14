/**
 * A client backed by records held in memory.
 *
 * Same port as the Webflow adapter, so a query can be run without a token, a
 * network call or a site: the queries' tests use this, and so can a local
 * preview. It is also the check that the port is a real seam - a query that
 * only works against `createWebflowClient` would not survive being handed this.
 */
import type { CmsClient, CmsRecord } from "./types";

export function createStaticClient(data: Record<string, CmsRecord[]>): CmsClient {
  return {
    async records(collection) {
      const records = data[collection];
      // Louder than an empty array: a typo'd collection slug would otherwise
      // look exactly like a collection nobody has filled in yet.
      if (!records) {
        throw new Error(
          `createStaticClient has no records for "${collection}". Has: ${
            Object.keys(data).join(", ") || "nothing"
          }`,
        );
      }
      return records;
    },
  };
}
