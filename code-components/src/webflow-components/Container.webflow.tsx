import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { HiddenPlaceholder } from "./HiddenPlaceholder";
import { Container, type ContainerProps } from "@/src/components/Container";
import { tokenOptions } from "@/src/tokens";

/**
 * v3 Container. Options are token names verbatim (design-tokens.md), so v1/v2
 * instances map across by name. Defaults mirror the v2 base variant: an
 * instance with nothing set renders like a default Attr | Container.
 */
function DeclaredContainer({ show = true, ...rest }: ContainerProps & { show?: boolean }) {
  if (!show) return <HiddenPlaceholder />;
  return <Container {...rest} />;
}

export default declareComponent(DeclaredContainer, {
  name: "Container | Library",
  description:
    "Layout box with a slot — the full-width section container. Background spans full width; gutters pad the content. Styles resolve from the site's Webflow variables.",
  group: "Harvey v3",
  props: {
    show: props.Visibility({ name: "Show", defaultValue: true }),
    size: props.Variant({
      name: "Container size",
      group: "Layout",
      options: tokenOptions("container"),
      defaultValue: "medium",
      tooltip: "Max width of the content (the site's container variables). Full = no constraint.",
    }),
    paddingTop: props.Variant({
      name: "Padding top",
      group: "Layout",
      options: tokenOptions("padding"),
      defaultValue: "large",
    }),
    paddingBottom: props.Variant({
      name: "Padding bottom",
      group: "Layout",
      options: tokenOptions("padding"),
      defaultValue: "large",
    }),
    gutters: props.Variant({
      name: "Gutters",
      group: "Layout",
      options: tokenOptions("gutters"),
      defaultValue: "standard",
      tooltip: "Side padding on the content. Standard is the site's gutter token.",
    }),
    background: props.Variant({
      name: "Background colour",
      group: "Style",
      options: tokenOptions("colour"),
      defaultValue: "transparent",
    }),
    textColour: props.Variant({
      name: "Text colour",
      group: "Style",
      options: tokenOptions("colour"),
      defaultValue: "inherit",
    }),
    corners: props.Variant({
      name: "Corners",
      group: "Style",
      options: tokenOptions("corners"),
      defaultValue: "none",
      tooltip: "Border radius — for card-style containers.",
    }),
    children: props.Slot({ name: "Content" }),
  },
});
