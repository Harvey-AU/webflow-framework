import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { Text, type TextProps } from "@/src/components/Text";
import { DECORATION_OPTIONS } from "@/src/components/typography";
import { GLYPH_NAMES } from "@/src/icons/glyphs";
import { tokenOptions, typeSizeOptions } from "@/src/tokens";

function DeclaredText({ show = true, ...rest }: TextProps & { show?: boolean }) {
  if (!show) return null;
  return <Text {...rest} />;
}

export default declareComponent(DeclaredText, {
  name: "Text",
  description:
    "Paragraph block; also the typography source for Button and Tag labels. Optional inline icon after the text.",
  group: "Harvey v3",
  props: {
    show: props.Visibility({ name: "Show", defaultValue: true }),
    text: props.TextNode({ name: "Text", group: "Content", defaultValue: "Text", multiline: true }),
    size: props.Variant({
      name: "Size",
      group: "Style",
      options: ["inherit", ...typeSizeOptions()],
      defaultValue: "inherit",
    }),
    weight: props.Variant({
      name: "Weight",
      group: "Style",
      options: ["inherit", ...tokenOptions("weight")],
      defaultValue: "inherit",
    }),
    align: props.Variant({
      name: "Align",
      group: "Style",
      options: ["inherit", ...tokenOptions("textAlign")],
      defaultValue: "inherit",
    }),
    decoration: props.Variant({
      name: "Decoration",
      group: "Style",
      options: [...DECORATION_OPTIONS],
      defaultValue: "none",
    }),
    icon: props.Variant({
      name: "Glyph",
      group: "Icon",
      options: ["none", ...GLYPH_NAMES],
      defaultValue: "none",
      tooltip: "Inline glyph after the text. None hides it.",
    }),
  },
});
