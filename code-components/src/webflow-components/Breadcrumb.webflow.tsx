import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { Breadcrumb, type BreadcrumbProps } from "@/src/components/Breadcrumb";
import { GLYPH_NAMES } from "@/src/icons/glyphs";
import { tokenOptions, typeSizeOptions } from "@/src/tokens";

function DeclaredBreadcrumb({ show = true, ...rest }: BreadcrumbProps & { show?: boolean }) {
  if (!show) return null;
  return <Breadcrumb {...rest} />;
}

export default declareComponent(DeclaredBreadcrumb, {
  name: "Breadcrumb",
  description:
    "Breadcrumb trail — Home plus up to three items with slash separators, sized by the site's breadcrumb variables.",
  group: "Harvey v3",
  props: {
    show: props.Visibility({ name: "Show", defaultValue: true }),
    homeText: props.TextNode({ name: "Home text", defaultValue: "Home" }),
    homeLink: props.Link({ name: "Home link" }),
    item1Text: props.TextNode({ name: "Item 1 text", defaultValue: "Page" }),
    item1Link: props.Link({ name: "Item 1 link" }),
    showItem2: props.Boolean({
      name: "Item 2 show",
      defaultValue: false,
      trueLabel: "Shown",
      falseLabel: "Hidden",
    }),
    item2Text: props.TextNode({ name: "Item 2 text", defaultValue: "Page" }),
    item2Link: props.Link({ name: "Item 2 link" }),
    showItem3: props.Boolean({
      name: "Item 3 show",
      defaultValue: false,
      trueLabel: "Shown",
      falseLabel: "Hidden",
    }),
    item3Text: props.TextNode({ name: "Item 3 text", defaultValue: "Page" }),
    item3Link: props.Link({ name: "Item 3 link" }),
    separator: props.Variant({
      name: "Separator",
      options: ["none", ...GLYPH_NAMES],
      defaultValue: "forward-slash",
      tooltip: "Glyph between items. None removes it.",
    }),
    size: props.Variant({
      name: "Size",
      options: typeSizeOptions(),
      defaultValue: "breadcrumb",
    }),
    colour: props.Variant({
      name: "Colour",
      options: tokenOptions("colour"),
      defaultValue: "inherit",
    }),
  },
});
