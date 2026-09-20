import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { HiddenPlaceholder } from "./HiddenPlaceholder";
import { HorizontalLine, type HorizontalLineProps } from "@/src/components/HorizontalLine";
import { tokenOptions } from "@/src/tokens";

function DeclaredLine({ show = true, ...rest }: HorizontalLineProps & { show?: boolean }) {
  if (!show) return <HiddenPlaceholder />;
  return <HorizontalLine {...rest} />;
}

const THICKNESS = ["hr", ...tokenOptions("border").filter((o) => o !== "none" && o !== "button")];

export default declareComponent(DeclaredLine, {
  name: "Horizontal Line | Library",
  description:
    "Divider with built-in space above and below. The hr defaults follow the site's divider variables; override thickness/colour per instance if a design needs it.",
  group: "Harvey v3",
  props: {
    show: props.Visibility({ name: "Show", defaultValue: true }),
    thickness: props.Variant({
      name: "Thickness",
      options: THICKNESS,
      defaultValue: "hr",
      tooltip: "hr = the site's divider thickness variable.",
    }),
    colour: props.Variant({
      name: "Colour",
      options: ["hr", ...tokenOptions("colour")],
      defaultValue: "hr",
      tooltip: "hr = the site's divider colour variable. Inherit = current text colour.",
    }),
    spacerAbove: props.Variant({
      name: "Spacer above",
      options: tokenOptions("spacer"),
      defaultValue: "xxsmall",
    }),
    spacerBelow: props.Variant({
      name: "Spacer below",
      options: tokenOptions("spacer"),
      defaultValue: "xsmall",
    }),
  },
});
