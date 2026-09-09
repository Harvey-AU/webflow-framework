import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { WordCatalog, type WordCatalogProps } from "@/src/components/WordCatalog";
import { EMPTY_CATALOG } from "@/src/config/site";
import type { CatalogData } from "@/src/lib/catalog-types";
import catalogFunction from "@/src/webflow-functions/catalog.webflow.function";
import { useQuery } from "./use-query";

/**
 * The call site: run the query, hand the result to the component.
 *
 * `WordCatalog` takes `entries` and `themeTree` as props, so it renders the
 * same whether they came from this CMS, another one, or a fixture in a test.
 */
function ConnectedWordCatalog(
  catalogProps: Omit<WordCatalogProps, "entries" | "themeTree">,
) {
  const { entries, themeTree } = useQuery<CatalogData>(
    "kaytetye:catalog",
    catalogFunction,
    EMPTY_CATALOG,
  );
  return <WordCatalog {...catalogProps} entries={entries} themeTree={themeTree} />;
}

export default declareComponent(ConnectedWordCatalog, {
  name: "Word Catalog",
  description:
    "Filter panel, results grid and pagination in one block. Drop it on a page and it works.",
  group: "Kaytetye",
  props: {
    heading: props.Text({ name: "Filter heading", group: "Filters", defaultValue: "Filter by" }),
    searchPlaceholder: props.Text({
      name: "Search placeholder",
      group: "Filters",
      defaultValue: "Enter keywords",
    }),
    showSort: props.Boolean({
      name: "Sort control",
      group: "Filters",
      defaultValue: true,
      trueLabel: "Shown",
      falseLabel: "Hidden",
    }),
    sortLabel: props.Text({ name: "Sort label", group: "Filters", defaultValue: "Sort" }),
    showMedia: props.Boolean({
      name: "Media facet",
      group: "Filters",
      defaultValue: true,
      trueLabel: "Shown",
      falseLabel: "Hidden",
    }),
    mediaLabel: props.Text({ name: "Media label", group: "Filters", defaultValue: "Media" }),
    sidebarWidth: props.Number({
      name: "Sidebar width",
      group: "Layout",
      defaultValue: 310,
      min: 200,
      max: 480,
      decimals: 0,
    }),
    columns: props.Number({
      name: "Columns",
      group: "Layout",
      defaultValue: 3,
      min: 1,
      max: 6,
      decimals: 0,
    }),
    showGloss: props.Boolean({
      name: "English gloss",
      group: "Content",
      defaultValue: true,
      trueLabel: "Shown",
      falseLabel: "Hidden",
    }),
    showScientificName: props.Boolean({
      name: "Scientific name",
      group: "Content",
      defaultValue: false,
      trueLabel: "Shown",
      falseLabel: "Hidden",
    }),
    emptyMessage: props.Text({
      name: "Empty message",
      group: "Content",
      defaultValue: "No words match those filters.",
    }),
    previousLabel: props.Text({ name: "Previous label", group: "Content", defaultValue: "Previous" }),
    nextLabel: props.Text({ name: "Next label", group: "Content", defaultValue: "Next" }),
  },
  // Prerender rather than false: useSuspenseData resolves the CMS read before
  // first paint, so all the words are in the served HTML and indexable.
  options: { ssr: "prerender" },
});
