import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { Tag, type TagProps } from "@/src/components/Tag";
import { BUTTON_COLOUR_OPTIONS, BUTTON_SIZE_OPTIONS } from "@/src/components/Button";
import { GLYPH_NAMES } from "@/src/icons/glyphs";
import { tokenOptions } from "@/src/tokens";

function DeclaredTag({ show = true, ...rest }: TagProps & { show?: boolean }) {
  if (!show) return null;
  return <Tag {...rest} />;
}

export default declareComponent(DeclaredTag, {
  name: "Tag",
  description:
    "Label chip — looks exactly like Button (same colour, size and corner options) but has no link and no hover.",
  group: "Harvey v3",
  props: {
    show: props.Visibility({ name: "Show", defaultValue: true }),
    text: props.TextNode({ name: "Text", group: "Content", defaultValue: "Tag" }),
    colour: props.Variant({
      name: "Colour",
      group: "Style",
      options: BUTTON_COLOUR_OPTIONS,
      defaultValue: "standard",
    }),
    size: props.Variant({
      name: "Size",
      group: "Style",
      options: [...BUTTON_SIZE_OPTIONS],
      defaultValue: "standard",
    }),
    corners: props.Variant({
      name: "Corners",
      group: "Style",
      options: tokenOptions("corners"),
      defaultValue: "button",
    }),
    iconBefore: props.Variant({
      name: "Before text",
      group: "Icon",
      options: ["none", ...GLYPH_NAMES],
      defaultValue: "none",
      tooltip: "Glyph before the text. None hides it.",
    }),
    iconAfter: props.Variant({
      name: "After text",
      group: "Icon",
      options: ["none", ...GLYPH_NAMES],
      defaultValue: "none",
      tooltip: "Glyph after the text. None hides it.",
    }),
  },
});
