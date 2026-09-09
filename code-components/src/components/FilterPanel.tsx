import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import {
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/ui";
import {
  hasMedia,
  selectEntries,
  setCatalogState,
  useCatalogState,
  useToggleFacet,
  type ListFacet,
} from "@/src/lib/catalog-state";
import {
  MEDIA_FACETS,
  SORTS,
  type Entry,
  type SortKey,
  type ThemeNode,
} from "@/src/lib/catalog-types";

export type FilterPanelProps = {
  /** Supplied by WordCatalog from the CMS; not Designer props. */
  entries?: Entry[];
  themeTree?: ThemeNode[];
  heading?: string;
  searchPlaceholder?: string;
  showMedia?: boolean;
  mediaLabel?: string;
  showSort?: boolean;
  sortLabel?: string;
};

export function FilterPanel({
  entries = [],
  themeTree = [],
  heading = "Filter by",
  searchPlaceholder = "Enter keywords",
  showMedia = true,
  mediaLabel = "Media",
  showSort = true,
  sortLabel = "Sort",
}: FilterPanelProps) {
  const state = useCatalogState();
  const toggle = useToggleFacet();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  // The mobile design collapses the whole theme list behind the heading so the
  // results stay reachable; on desktop it's always open and the toggle is gone.
  const [treeOpen, setTreeOpen] = useState(
    () => typeof window === "undefined" || window.matchMedia("(min-width: 768px)").matches,
  );
  // Radix portals to document.body by default, which is outside this shadow root.
  const [root, setRoot] = useState<HTMLElement | null>(null);

  const countBy = (facet: ListFacet, test: (e: Entry) => boolean) =>
    selectEntries(entries, state, facet).filter(test).length;

  const renderNode = (node: ThemeNode, depth: number) => {
    const kids = node.children ?? [];
    const isOpen = !collapsed[node.id];
    const count = countBy("themes", (e) => e.themes.includes(node.id));
    const id = `kt-theme-${node.id}`;

    return (
      <li key={node.id} className="flex flex-col">
        <div className="flex items-center gap-2 py-[3px]" style={{ paddingInlineStart: depth * 14 }}>
          <Checkbox
            id={id}
            className="border-country/50 data-[state=checked]:border-country data-[state=checked]:bg-country data-[state=checked]:text-cream size-3.5 rounded-[3px]"
            checked={state.themes.includes(node.id)}
            onCheckedChange={() => toggle("themes", node.id)}
          />
          <Label htmlFor={id} className="text-country-deep flex-1 text-xs font-semibold">
            {node.label}
          </Label>
          <span className="text-country/60 max-md:hidden text-[11px] tabular-nums">{count}</span>
          {kids.length > 0 && (
            <button
              type="button"
              aria-label={isOpen ? `Collapse ${node.label}` : `Expand ${node.label}`}
              aria-expanded={isOpen}
              onClick={() => setCollapsed((c) => ({ ...c, [node.id]: !collapsed[node.id] }))}
              className="text-country cursor-pointer p-0.5"
            >
              <ChevronDown className={`size-3.5 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
            </button>
          )}
        </div>
        {kids.length > 0 && isOpen && (
          <ul className="flex flex-col">{kids.map((k) => renderNode(k, depth + 1))}</ul>
        )}
      </li>
    );
  };

  return (
    <aside ref={setRoot} className="bg-cream font-mono flex w-full flex-col gap-4">
      <div className="relative">
        <Input
          type="search"
          value={state.q}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          onChange={(e) => setCatalogState({ q: e.target.value })}
          className="border-country/40 text-country-deep placeholder:text-country-deep/70 h-9 rounded-md pr-9 text-sm font-semibold"
        />
        <Search className="text-country pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
      </div>

      {showSort && (
        <div className="flex flex-col gap-1.5 max-md:hidden">
          <span className="text-country-deep text-xs font-semibold tracking-wider uppercase">
            {sortLabel}
          </span>
          <Select
            value={state.sort}
            onValueChange={(v) => setCatalogState({ sort: v as SortKey })}
          >
            <SelectTrigger
              aria-label={sortLabel}
              className="border-country/40 text-country-deep w-full text-sm font-semibold"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent container={root}>
              {SORTS.map((s) => (
                <SelectItem key={s.id} value={s.id} className="font-mono text-sm">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <h2
          id="kt-filter-heading"
          className="text-country-deep font-display text-lg leading-[26px] tracking-wide"
        >
          {heading}
        </h2>
        <button
          type="button"
          aria-controls="kt-theme-tree"
          aria-expanded={treeOpen}
          aria-labelledby="kt-filter-heading"
          onClick={() => setTreeOpen((open) => !open)}
          className="text-country cursor-pointer p-0.5 md:hidden"
        >
          {treeOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>
      <hr className="border-country/30" />

      <ul
        id="kt-theme-tree"
        className={`flex flex-col ${treeOpen ? "" : "max-md:hidden"}`}
      >
        {themeTree.map((n) => renderNode(n, 0))}
      </ul>

      {showMedia && (
        <div className="hidden flex-col gap-4 md:flex">
          <hr className="border-country/30" />
          <h3 className="text-country-deep text-xs font-semibold tracking-wider uppercase">
            {mediaLabel}
          </h3>
          <ul className="flex flex-col">
            {MEDIA_FACETS.map((f) => {
              const id = `kt-media-${f.id}`;
              const count = countBy("media", (e) => hasMedia(e, f.id));
              return (
                <li key={f.id} className="flex items-center gap-2 py-[3px]">
                  <Checkbox
                    id={id}
                    className="border-country/50 data-[state=checked]:border-country data-[state=checked]:bg-country data-[state=checked]:text-cream size-3.5 rounded-[3px]"
                    checked={state.media.includes(f.id)}
                    onCheckedChange={() => toggle("media", f.id)}
                  />
                  <Label htmlFor={id} className="text-country-deep flex-1 text-xs font-semibold">
                    {f.label}
                  </Label>
                  <span className="text-country/60 max-md:hidden text-[11px] tabular-nums">{count}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {/* The design closes the mobile panel with a rule under the tree. */}
      <hr className="border-country/30 md:hidden" />
    </aside>
  );
}
