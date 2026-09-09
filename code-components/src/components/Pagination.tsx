import {
  pageCount,
  selectEntries,
  setCatalogState,
  useCatalogState,
} from "@/src/lib/catalog-state";

export type PaginationProps = {
  previousLabel?: string;
  nextLabel?: string;
};

/** 1 … 4 5 6 … 10 — always first, last, and a window around the current page. */
function pageItems(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const window = new Set([1, total, current, current - 1, current + 1]);
  const pages = [...window].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export function Pagination({
  previousLabel = "Previous",
  nextLabel = "Next",
}: PaginationProps) {
  const state = useCatalogState();
  const total = pageCount(selectEntries(state).length);
  if (total <= 1) return null;

  const go = (page: number) => {
    setCatalogState({ page: Math.min(total, Math.max(1, page)) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Pagination"
      className="bg-cream font-mono flex w-full items-center justify-between gap-4 py-2 text-sm"
    >
      <button
        type="button"
        onClick={() => go(state.page - 1)}
        disabled={state.page === 1}
        className="text-cream bg-country rounded-full px-3 py-1 text-xs font-medium tracking-wider disabled:invisible"
      >
        {previousLabel}
      </button>

      <ul className="flex items-center gap-3">
        {pageItems(state.page, total).map((item, i) =>
          item === "gap" ? (
            <li key={`gap-${i}`} className="text-country px-1">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => go(item)}
                aria-current={item === state.page ? "page" : undefined}
                className={`size-7 rounded-full text-sm tabular-nums transition-colors ${
                  item === state.page
                    ? "bg-sky text-country"
                    : "text-country hover:bg-country/10"
                }`}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        onClick={() => go(state.page + 1)}
        disabled={state.page === total}
        className="text-country text-xs font-medium tracking-wider disabled:invisible"
      >
        {nextLabel}
      </button>
    </nav>
  );
}
