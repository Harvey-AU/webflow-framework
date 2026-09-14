import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { Heading, type HeadingProps } from "@/src/components/Heading";
import { DECORATION_OPTIONS } from "@/src/components/typography";
import { tokenOptions, typeSizeOptions } from "@/src/tokens";

function DeclaredHeading({ show = true, ...rest }: HeadingProps & { show?: boolean }) {
  if (!show) return null;
  return <Heading {...rest} />;
}

export default declareComponent(DeclaredHeading, {
  name: "Heading",
  description:
    "Heading block. Tag is SEO-only; Size styles independently (inherit = the tag's size from the site's variables). Font family comes from the site, not a prop.",
  group: "Harvey v3",
  props: {
    show: props.Visibility({ name: "Show", defaultValue: true }),
    text: props.TextNode({ name: "Text", defaultValue: "Heading" }),
    tag: props.Variant({
      name: "Tag",
      options: ["h1", "h2", "h3", "h4", "h5", "h6"],
      defaultValue: "h2",
      tooltip: "SEO/structure only — Size controls how it looks.",
    }),
    size: props.Variant({
      name: "Size",
      options: ["inherit", ...typeSizeOptions()],
      defaultValue: "inherit",
    }),
    weight: props.Variant({
      name: "Weight",
      options: ["inherit", ...tokenOptions("weight")],
      defaultValue: "inherit",
    }),
    align: props.Variant({
      name: "Align",
      options: ["inherit", ...tokenOptions("textAlign")],
      defaultValue: "inherit",
    }),
    decoration: props.Variant({
      name: "Decoration",
      options: [...DECORATION_OPTIONS],
      defaultValue: "none",
    }),
  },
});
