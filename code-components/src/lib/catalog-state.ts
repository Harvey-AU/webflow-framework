import { useCallback, useSyncExternalStore } from "react";
import {
  ENTRIES,
  type Entry,
  type MediaFilter,
  type SortKey,
} from "@/src/data/words";

/**
 * Filter state shared between separate code components.
 *
 * Each code component mounts in its own Shadow DOM with its own React root, so
 * Context, Redux and module singletons don't reach across them. The URL is the
 * one place all of them can see, so it's the store: the filter panel writes,
 * the grid and pagination read, and a custom event wakes everyone up.
 */
export type CatalogState = {
  q: string;
  themes: string[];
  media: MediaFilter[];
  sort: SortKey;
  page: number;
};

export type ListFacet = "themes" | "media";

const EVENT = "kaytetye:catalog";
const EMPTY: CatalogState = { q: "", themes: [], media: [], sort: "photos", page: 1 };

function parse(search: string): CatalogState {
  const p = new URLSearchParams(search);
  const list = (key: string) =>
    (p.get(key) ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const sort = p.get("sort");
  return {
    q: p.get("q") ?? "",
    themes: list("theme"),
    media: list("media") as MediaFilter[],
    // Photos first by default: 78 of the 118 entries are definitions with no image,
    // and an A-Z default leaves the grid looking half-empty.
    sort: sort === "gloss" || sort === "word" ? sort : "photos",
    page: Math.max(1, Number(p.get("page")) || 1),
  };
}

// useSyncExternalStore needs a stable reference while the URL is unchanged.
let cache: { search: string; state: CatalogState } | null = null;
// Used only where the URL can't be written - a sandboxed Designer canvas, say.
let memory: CatalogState | null = null;

function snapshot(): CatalogState {
  if (typeof window === "undefined") return EMPTY;
  if (memory) return memory;
  const search = window.location.search;
  if (!cache || cache.search !== search) cache = { search, state: parse(search) };
  return cache.state;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("popstate", onChange);
  };
}

export function setCatalogState(patch: Partial<CatalogState>) {
  const next = { ...snapshot(), ...patch };
  // Any filter change puts you back on page one, unless the page moved too.
  if (patch.page === undefined) next.page = 1;

  const p = new URLSearchParams(window.location.search);
  const set = (key: string, value: string) => (value ? p.set(key, value) : p.delete(key));
  set("q", next.q);
  set("theme", next.themes.join(","));
  set("media", next.media.join(","));
  set("sort", next.sort === "photos" ? "" : next.sort);
  set("page", next.page > 1 ? String(next.page) : "");

  const qs = p.toString();
  try {
    history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
    memory = null;
  } catch {
    // Sandboxed frame: keep the state in memory so the UI still works, and
    // accept that it stops being shareable in this context.
    memory = next;
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useCatalogState(): CatalogState {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

/** Toggle one value in a list-shaped facet. */
export function useToggleFacet() {
  const state = useCatalogState();
  return useCallback(
    (facet: ListFacet, value: string) => {
      const current: string[] = state[facet];
      setCatalogState({
        [facet]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      });
    },
    [state],
  );
}

const hasMedia = (e: Entry, m: MediaFilter) =>
  m === "photo" ? Boolean(e.image) : m === "audio" ? Boolean(e.audio) : Boolean(e.storyEnglish);

/**
 * The single definition of "what is showing". Both the grid and the pagination
 * import this so their idea of the result set can't drift apart.
 */
export function selectEntries(state: CatalogState, ignore?: ListFacet): Entry[] {
  const q = state.q.trim().toLowerCase();
  const out = ENTRIES.filter((e) => {
    if (
      q &&
      !`${e.word} ${e.gloss} ${e.scientific} ${e.defEnglish}`.toLowerCase().includes(q)
    )
      return false;
    // Themes are OR within the facet: pick two leaves, see both.
    if (ignore !== "themes" && state.themes.length && !state.themes.some((t) => e.themes.includes(t)))
      return false;
    // Media is AND: "has a photo" and "has a recording" means both.
    if (ignore !== "media" && state.media.length && !state.media.every((m) => hasMedia(e, m)))
      return false;
    return true;
  });

  const collate = (a: string, b: string) => a.localeCompare(b, "en");
  const sorters: Record<SortKey, (a: Entry, b: Entry) => number> = {
    word: (a, b) => collate(a.word.toLowerCase(), b.word.toLowerCase()),
    gloss: (a, b) => collate(a.gloss.toLowerCase(), b.gloss.toLowerCase()),
    photos: (a, b) =>
      Number(Boolean(b.image)) - Number(Boolean(a.image)) ||
      collate(a.word.toLowerCase(), b.word.toLowerCase()),
  };
  return out.sort(sorters[state.sort]);
}

export const PER_PAGE = 12;

export function pageCount(total: number) {
  return Math.max(1, Math.ceil(total / PER_PAGE));
}
