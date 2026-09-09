/**
 * Webflow Data API reads, for use inside Code Functions only.
 *
 * This runs in the worker runtime, never in the browser: the site token comes
 * from `ctx.env` and must not reach a client bundle. Importing this from a
 * component is a mistake — the components take data as props or through
 * `useSuspenseData`.
 */

const API = "https://api.webflow.com/v2";

export type CmsItem = {
  id: string;
  fieldData: Record<string, unknown>;
};

/** Env keys the functions expect. Set both on the Webflow side, not in code. */
export type CmsEnv = {
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
    // status alone when a scope or collection id is wrong.
    const body = await res.text().catch(() => "");
    throw new Error(`Webflow ${res.status} on ${path}: ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

// One function invocation reads several collections. Without this, each
// liveItems() call re-fetches the whole collection list.
let collectionCache: { siteId: string; map: Map<string, string> } | null = null;

/**
 * Resolve a collection id from its slug.
 *
 * Slugs rather than hardcoded ids, so the library stays portable: any site with
 * a `words` collection works without a per-site build.
 */
export async function collectionIdBySlug(
  env: Record<string, unknown>,
  slug: string,
): Promise<string> {
  const { token, siteId } = credentials(env);
  if (collectionCache?.siteId === siteId) {
    const hit = collectionCache.map.get(slug);
    if (hit) return hit;
  }
  const { collections } = await get<{ collections: { id: string; slug: string }[] }>(
    `/sites/${siteId}/collections`,
    token,
  );
  collectionCache = {
    siteId,
    map: new Map(collections.map((c) => [c.slug, c.id])),
  };
  const match = collections.find((c) => c.slug === slug);
  if (!match) {
    throw new Error(
      `No collection with slug "${slug}" on site ${siteId}. Found: ${collections
        .map((c) => c.slug)
        .join(", ")}`,
    );
  }
  return match.id;
}

/**
 * Every live item in a collection, following pagination.
 *
 * Live items only: drafts and unpublished edits stay out of the rendered site,
 * which is the same content a visitor would see.
 */
export async function liveItems(
  env: Record<string, unknown>,
  collectionSlug: string,
): Promise<CmsItem[]> {
  const { token } = credentials(env);
  const collectionId = await collectionIdBySlug(env, collectionSlug);

  const out: CmsItem[] = [];
  const limit = 100;
  for (let offset = 0; ; offset += limit) {
    const page = await get<{
      items: CmsItem[];
      pagination: { total: number };
    }>(`/collections/${collectionId}/items/live?limit=${limit}&offset=${offset}`, token);

    out.push(...page.items);
    if (out.length >= page.pagination.total || page.items.length === 0) break;
  }
  return out;
}

/** Field readers that tolerate the shapes Webflow returns for empty fields. */
export const field = {
  text(data: Record<string, unknown>, key: string): string {
    const v = data[key];
    return typeof v === "string" ? v : "";
  },
  /** Image fields arrive as `{ url }`; empty ones as null. */
  imageUrl(data: Record<string, unknown>, key: string): string | null {
    const v = data[key];
    if (v && typeof v === "object" && "url" in v) {
      const url = (v as { url?: unknown }).url;
      return typeof url === "string" ? url : null;
    }
    return null;
  },
  /** Link fields are plain strings; treat empty string as absent. */
  link(data: Record<string, unknown>, key: string): string | null {
    const v = data[key];
    return typeof v === "string" && v ? v : null;
  },
  /** Reference and multi-reference fields hold item ids. */
  refs(data: Record<string, unknown>, key: string): string[] {
    const v = data[key];
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
    return typeof v === "string" && v ? [v] : [];
  },
  ref(data: Record<string, unknown>, key: string): string | null {
    const v = data[key];
    return typeof v === "string" && v ? v : null;
  },
  number(data: Record<string, unknown>, key: string): number | null {
    const v = data[key];
    return typeof v === "number" ? v : null;
  },
};
