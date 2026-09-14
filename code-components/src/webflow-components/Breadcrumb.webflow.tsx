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
    homeText: props.TextNode({ name: "Text", group: "Home", defaultValue: "Home" }),
    homeLink: props.Link({ name: "Link", group: "Home" }),
    item1Text: props.TextNode({ name: "Text", group: "Item 1", defaultValue: "Page" }),
    item1Link: props.Link({ name: "Link", group: "Item 1" }),
    showItem2: props.Boolean({
      name: "Show",
      group: "Item 2",
      defaultValue: false,
      trueLabel: "Shown",
      falseLabel: "Hidden",
    }),
    item2Text: props.TextNode({ name: "Text", group: "Item 2", defaultValue: "Page" }),
    item2Link: props.Link({ name: "Link", group: "Item 2" }),
    showItem3: props.Boolean({
      name: "Show",
      group: "Item 3",
      defaultValue: false,
      trueLabel: "Shown",
      falseLabel: "Hidden",
    }),
    item3Text: props.TextNode({ name: "Text", group: "Item 3", defaultValue: "Page" }),
    item3Link: props.Link({ name: "Link", group: "Item 3" }),
    separator: props.Variant({
      name: "Separator",
      group: "Style",
      options: ["none", ...GLYPH_NAMES],
      defaultValue: "forward-slash",
      tooltip: "Glyph between items. None removes it.",
    }),
    size: props.Variant({
      name: "Size",
      group: "Style",
      options: typeSizeOptions(),
      defaultValue: "breadcrumb",
    }),
    colour: props.Variant({
      name: "Colour",
      group: "Style",
      options: tokenOptions("colour"),
      defaultValue: "inherit",
    }),
  },
});
