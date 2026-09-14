/**
 * The Webflow adapter for the CMS port. Code Functions only.
 *
 * This runs in the worker runtime, never in the browser: the site token comes
 * from `ctx.env` and must not reach a client bundle. Everything Webflow-shaped
 * stops here - collection ids, pagination, the wrappers it puts around image
 * and file fields. Above this line a query sees `CmsRecord`s and could be
 * served by any other CMS.
 */
import type { CmsClient, CmsRecord } from "./types";

// Reads go to the CDN host. Webflow's own guidance: the CDN-backed endpoints
// are for high-volume reads, api.webflow.com is for writes and management.
const API = "https://api-cdn.webflow.com/v2";

/** Env keys the adapter needs. Set both on the Webflow side, not in code. */
export type WebflowCmsEnv = {
  WEBFLOW_SITE_TOKEN?: unknown;
  WEBFLOW_SITE_ID?: unknown;
};

function credentials(env: Record<string, unknown>) {
  const token = env.WEBFLOW_SITE_TOKEN;
  const siteId = env.WEBFLOW_SITE_ID;
  if (typeof token !== "string" || !token) {
    throw new Error("WEBFLOW_SITE_TOKEN is not set on the function runtime");
  }
  if (typeof siteId !== "string" || !siteId) {
    throw new Error("WEBFLOW_SITE_ID is not set on the function runtime");
  }
  return { token, siteId };
}

async function get<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { authorization: `Bearer ${token}`, accept: "application/json" },
  });
  if (!res.ok) {
    // The body carries Webflow's own message, which is far more useful than the
    // status alone when a scope or a collection slug is wrong.
    const body = await res.text().catch(() => "");
    throw new Error(`Webflow ${res.status} on ${path}: ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

/**
 * Webflow returns Image and File fields as `{ url, alt, ... }`; flatten to the
 * URL so a query reads the same string it gets from a Link field, and so
 * another adapter can satisfy the same field readers without imitating
 * Webflow's wrapper. Multi-image fields arrive as arrays of those objects.
 */
function assetUrl(value: unknown): string | null {
  if (value && typeof value === "object" && !Array.isArray(value) && "url" in value) {
    const url = (value as { url?: unknown }).url;
    if (typeof url === "string") return url;
  }
  return null;
}

function flatten(value: unknown): unknown {
  const single = assetUrl(value);
  if (single !== null) return single;
  if (Array.isArray(value)) {
    return value.map((entry) => assetUrl(entry) ?? entry);
  }
  return value;
}

type WebflowItem = { id: string; fieldData?: Record<string, unknown> };

function toRecord(item: WebflowItem): CmsRecord {
  const fields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(item.fieldData ?? {})) {
    fields[key] = flatten(value);
  }
  return { id: item.id, fields };
}

// Module level rather than per client: a warm worker reuses this across
// invocations, so the collection list is fetched once rather than per request.
let collectionCache: { siteId: string; map: Map<string, string> } | null = null;

/**
 * A client bound to one Webflow site's credentials.
 *
 * Collections are addressed by slug rather than by hardcoded id, so the library
 * stays portable: any site with a `words` collection works without a per-site
 * build.
 */
export function createWebflowClient(env: Record<string, unknown>): CmsClient {
  const { token, siteId } = credentials(env);

  async function collectionId(slug: string): Promise<string> {
    if (collectionCache?.siteId === siteId) {
      const hit = collectionCache.map.get(slug);
      if (hit) return hit;
    }
    const { collections } = await get<{ collections: { id: string; slug: string }[] }>(
      `/sites/${siteId}/collections`,
      token,
    );
    collectionCache = { siteId, map: new Map(collections.map((c) => [c.slug, c.id])) };
    const match = collectionCache.map.get(slug);
    if (!match) {
      throw new Error(
        `No collection with slug "${slug}" on site ${siteId}. Found: ${collections
          .map((c) => c.slug)
          .join(", ")}`,
      );
    }
    return match;
  }

  return {
    async records(collection) {
      const id = await collectionId(collection);

      // Live items only: drafts and unpublished edits stay out, so a function
      // returns the same content a visitor would see.
      const out: CmsRecord[] = [];
      const limit = 100;
      for (let offset = 0; ; offset += limit) {
        const page = await get<{ items: WebflowItem[]; pagination: { total: number } }>(
          `/collections/${id}/items/live?limit=${limit}&offset=${offset}`,
          token,
        );
        out.push(...page.items.map(toRecord));
        if (out.length >= page.pagination.total || page.items.length === 0) break;
      }
      return out;
    },
  };
}
