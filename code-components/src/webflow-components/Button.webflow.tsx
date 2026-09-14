import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import {
  Button,
  BUTTON_COLOUR_OPTIONS,
  BUTTON_SIZE_OPTIONS,
  type ButtonProps,
} from "@/src/components/Button";
import { GLYPH_NAMES } from "@/src/icons/glyphs";
import { tokenOptions } from "@/src/tokens";

function DeclaredButton({ show = true, ...rest }: ButtonProps & { show?: boolean }) {
  if (!show) return null;
  return <Button {...rest} />;
}

export default declareComponent(DeclaredButton, {
  name: "Button",
  description:
    "Button — link with a label and optional icon, coloured by the site's semantic button variables. Hover states come with the colour choice.",
  group: "Harvey v3",
  props: {
    show: props.Visibility({ name: "Show", defaultValue: true }),
    text: props.TextNode({ name: "Text", defaultValue: "Button" }),
    link: props.Link({ name: "Link" }),
    colour: props.Variant({
      name: "Colour",
      options: BUTTON_COLOUR_OPTIONS,
      defaultValue: "standard",
      tooltip:
        "colour-N filled · outline-N outlined · outline-no-fill-N never fills · hover-N starts in hover colours · text-N text only.",
    }),
    size: props.Variant({
      name: "Size",
      options: [...BUTTON_SIZE_OPTIONS],
      defaultValue: "standard",
    }),
    corners: props.Variant({
      name: "Corners",
      options: tokenOptions("corners"),
      defaultValue: "button",
      tooltip: "For a pill use full — the button token is square on the library.",
    }),
    icon: props.Variant({
      name: "Icon",
      options: ["none", ...GLYPH_NAMES],
      defaultValue: "none",
      tooltip: "None hides the icon. CAF's usual glyph is arrow-stem-up-right.",
    }),
  },
});
