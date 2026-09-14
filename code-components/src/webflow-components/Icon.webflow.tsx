import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { Icon, ICON_SIZE_OPTIONS, type IconProps } from "@/src/components/Icon";
import { GLYPH_NAMES } from "@/src/icons/glyphs";
import { tokenOptions } from "@/src/tokens";

function DeclaredIcon({ show = true, ...rest }: IconProps & { show?: boolean }) {
  if (!show) return null;
  return <Icon {...rest} />;
}

export default declareComponent(DeclaredIcon, {
  name: "Icon",
  description:
    "Inline SVG glyph from the v1 icon set (49 glyphs, same names). Weight adjusts stroke thickness on line glyphs; filled glyphs (triangles, dot, plus, content icons) ignore it.",
  group: "Harvey v3",
  props: {
    show: props.Visibility({ name: "Show", defaultValue: true }),
    glyph: props.Variant({
      name: "Glyph",
      options: [...GLYPH_NAMES],
      defaultValue: "arrow-stem-right",
    }),
    size: props.Variant({
      name: "Size",
      options: [...ICON_SIZE_OPTIONS],
      defaultValue: "inherit",
      tooltip: "Relative to the surrounding text. Inherit = 1.35em, v1's icon height.",
    }),
    colour: props.Variant({
      name: "Colour",
      options: tokenOptions("colour"),
      defaultValue: "inherit",
    }),
    weight: props.Number({
      name: "Weight",
      defaultValue: 1.25,
      min: 0.5,
      max: 3,
      decimals: 2,
      tooltip: "Stroke thickness. 1.25 is the v1 default. No effect on filled glyphs.",
    }),
  },
});
