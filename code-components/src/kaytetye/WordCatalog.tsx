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
    <section className="bg-cream w-full px-8 py-16">
      <div
        className="mx-auto grid max-w-[1376px] gap-16 max-md:grid-cols-1"
        style={{ gridTemplateColumns: `${sidebarWidth}px minmax(0, 1fr)` }}
      >
        <FilterPanel
          heading={heading}
          searchPlaceholder={searchPlaceholder}
          showMedia={showMedia}
          mediaLabel={mediaLabel}
          showSort={showSort}
          sortLabel={sortLabel}
        />
        <div className="flex flex-col gap-10">
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
