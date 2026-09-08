import type { CSSProperties } from "react";
import { PER_PAGE, selectEntries, useCatalogState } from "@/src/lib/catalog-state";

export type WordGridProps = {
  columns?: number;
  emptyMessage?: string;
  showScientificName?: boolean;
  showGloss?: boolean;
};

export function WordGrid({
  columns = 3,
  emptyMessage = "No words match those filters.",
  showScientificName = false,
  showGloss = true,
}: WordGridProps) {
  const state = useCatalogState();
  const all = selectEntries(state);
  const start = (state.page - 1) * PER_PAGE;
  const visible = all.slice(start, start + PER_PAGE);

  if (!visible.length) {
    return (
      <p className="bg-cream text-country-deep font-mono py-16 text-center text-sm font-semibold">
        {emptyMessage}
      </p>
    );
  }

  return (
    // Two columns on mobile per the design; the `columns` prop takes over at
    // `sm`. Same reason as the catalog wrapper for going through a custom
    // property - an inline template would beat the responsive classes.
    <div
      className="bg-cream font-mono grid w-full grid-cols-2 gap-4 sm:gap-6 sm:[grid-template-columns:repeat(var(--kt-cols),minmax(0,1fr))]"
      style={{ "--kt-cols": columns } as CSSProperties}
    >
      {visible.map((e) => (
        <article key={e.slug} className="flex flex-col gap-2">
          {e.image ? (
            <img
              src={e.image}
              alt={e.gloss}
              loading="lazy"
              className="aspect-7/6 w-full rounded-sm object-cover"
            />
          ) : (
            // 78 of the 118 entries are definitions with no photograph.
            <div className="bg-country/10 text-country/70 font-display aspect-7/6 flex w-full items-center justify-center rounded-sm px-4 text-center text-2xl tracking-wide">
              {e.word}
            </div>
          )}
          <h3 className="text-country font-display text-lg leading-[26px] tracking-wide">
            {e.word}
          </h3>
          {showGloss && <p className="text-country text-sm font-semibold">{e.gloss}</p>}
          {showScientificName && e.scientific && (
            <p className="text-country-deep/80 text-xs italic">{e.scientific}</p>
          )}
        </article>
      ))}
    </div>
  );
}
