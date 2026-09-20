import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { HiddenPlaceholder } from "./HiddenPlaceholder";
import { Flex, type FlexProps } from "@/src/components/Flex";
import { tokenOptions } from "@/src/tokens";

function DeclaredFlex({ show = true, ...rest }: FlexProps & { show?: boolean }) {
  if (!show) return <HiddenPlaceholder />;
  return <Flex {...rest} />;
}

const DIRECTIONS = ["row", "column"] as const;

export default declareComponent(DeclaredFlex, {
  name: "Flex | Library",
  description:
    "Row or column group for buttons, tags and similar. Rows centre items, columns stretch them; wrapping is off unless turned on.",
  group: "Harvey v3",
  props: {
    show: props.Visibility({ name: "Show", defaultValue: true }),
    direction: props.Variant({
      name: "Direction",
      group: "Layout",
      options: [...DIRECTIONS],
      defaultValue: "row",
    }),
    directionMobileL: props.Variant({
      name: "Direction mobile L",
      group: "Layout",
      options: ["inherit", ...DIRECTIONS],
      defaultValue: "inherit",
      tooltip: "Applies 767px and below — e.g. stack a button row on mobile.",
    }),
    gap: props.Variant({
      name: "Gap",
      group: "Layout",
      options: tokenOptions("gap"),
      defaultValue: "small",
    }),
    wrap: props.Variant({
      name: "Wrap",
      group: "Layout",
      options: ["no-wrap", "wrap"],
      defaultValue: "no-wrap",
      tooltip: "Wrap lets a long row break onto new lines (tag clouds, logo strips).",
    }),
    children: props.Slot({ name: "Content" }),
  },
});
