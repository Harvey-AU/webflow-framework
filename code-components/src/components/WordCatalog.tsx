import type { CSSProperties } from "react";
import { FilterPanel, type FilterPanelProps } from "./FilterPanel";
import { WordGrid, type WordGridProps } from "./WordGrid";
import { Pagination, type PaginationProps } from "./Pagination";

export type WordCatalogProps = FilterPanelProps &
  WordGridProps &
  PaginationProps & {
    sidebarWidth?: number;
  };

/**
 * Filter panel, results grid and pagination as one droppable unit.
 * They still coordinate through the shared catalog state, so the three can be
 * placed separately later without changing any of them.
 */
export function WordCatalog({
  heading,
  searchPlaceholder,
  showMedia,
  mediaLabel,
  showSort,
  sortLabel,
  columns,
  emptyMessage,
  showScientificName,
  showGloss,
  previousLabel,
  nextLabel,
  sidebarWidth = 310,
}: WordCatalogProps) {
  return (
    // Same page gutter and content width as the other sections, so the block
    // carries its own padding wherever it's dropped in Webflow.
    <section className="bg-cream w-full px-5 py-[42px] md:px-8 md:py-16">
      {/* The sidebar width arrives as a custom property rather than an inline
          `grid-template-columns`: an inline style outranks every class, so
          setting the template directly stopped the one-column stack below `md`
          from ever applying and squeezed the results into a sliver. */}
      <div
        className="mx-auto grid max-w-[1376px] grid-cols-1 gap-7 md:gap-16 md:[grid-template-columns:var(--kt-sidebar)_minmax(0,1fr)]"
        style={{ "--kt-sidebar": `${sidebarWidth}px` } as CSSProperties}
      >
        <FilterPanel
          heading={heading}
          searchPlaceholder={searchPlaceholder}
          showMedia={showMedia}
          mediaLabel={mediaLabel}
          showSort={showSort}
          sortLabel={sortLabel}
        />
        <div className="flex flex-col gap-5 md:gap-10">
          <WordGrid
            columns={columns}
            emptyMessage={emptyMessage}
            showScientificName={showScientificName}
            showGloss={showGloss}
          />
          <Pagination previousLabel={previousLabel} nextLabel={nextLabel} />
        </div>
      </div>
    </section>
  );
}
