import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { Grid, type GridProps } from "@/src/components/Grid";
import { tokenOptions } from "@/src/tokens";

/**
 * v3 Grid. Options are token names verbatim; defaults are v1's production
 * defaults (two-50-50 / medium / medium / center). Breakpoint axes default
 * to inherit; with nothing set the grid auto-stacks below 767px.
 */
function DeclaredGrid({ show = true, ...rest }: GridProps & { show?: boolean }) {
  if (!show) return null;
  return <Grid {...rest} />;
}

const DIRECTIONS = ["standard", "reverse"] as const;

export default declareComponent(DeclaredGrid, {
  name: "Grid | Library",
  description:
    "CSS grid layout — each element dropped in the slot is one cell. Responsive columns and direction; auto-stacks to one column on mobile when nothing is set.",
  group: "Harvey v3",
  props: {
    show: props.Visibility({ name: "Show", defaultValue: true }),
    columns: props.Variant({
      name: "Columns",
      group: "Layout",
      options: tokenOptions("columns"),
      defaultValue: "two-50-50",
    }),
    columnsTablet: props.Variant({
      name: "Columns tablet",
      group: "Layout",
      options: ["inherit", ...tokenOptions("columns")],
      defaultValue: "inherit",
      tooltip: "Applies 991px and below. Inherit keeps the desktop layout.",
    }),
    columnsMobileL: props.Variant({
      name: "Columns mobile L",
      group: "Layout",
      options: ["inherit", ...tokenOptions("columns")],
      defaultValue: "inherit",
      tooltip:
        "Applies 767px and below. With both breakpoint axes on inherit the grid stacks to one column here.",
    }),
    columnGap: props.Variant({
      name: "Column gap",
      group: "Layout",
      options: tokenOptions("gap"),
      defaultValue: "medium",
    }),
    rowGap: props.Variant({
      name: "Row gap",
      group: "Layout",
      options: tokenOptions("gap"),
      defaultValue: "medium",
    }),
    direction: props.Variant({
      name: "Direction",
      group: "Layout",
      options: [...DIRECTIONS],
      defaultValue: "standard",
      tooltip: "Reverse mirrors the column order.",
    }),
    directionTablet: props.Variant({
      name: "Direction tablet",
      group: "Layout",
      options: ["inherit", ...DIRECTIONS],
      defaultValue: "inherit",
      tooltip:
        "Applies 991px and below — e.g. put the image above the text once the grid stacks.",
    }),
    directionMobileL: props.Variant({
      name: "Direction mobile L",
      group: "Layout",
      options: ["inherit", ...DIRECTIONS],
      defaultValue: "inherit",
      tooltip: "Applies 767px and below.",
    }),
    valign: props.Variant({
      name: "Vertical alignment",
      group: "Layout",
      options: tokenOptions("alignment"),
      defaultValue: "center",
    }),
    children: props.Slot({ name: "Content" }),
  },
});
