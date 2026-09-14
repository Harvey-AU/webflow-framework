import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { RichText, type RichTextProps } from "@/src/components/RichText";
import { tokenOptions, typeSizeOptions } from "@/src/tokens";

function DeclaredRichText({ show = true, ...rest }: RichTextProps & { show?: boolean }) {
  if (!show) return null;
  return <RichText {...rest} />;
}

export default declareComponent(DeclaredRichText, {
  name: "Rich Text",
  description:
    "Rich text block. Style article swaps the divider styling to the article variables, as v1's two rich text classes did.",
  group: "Harvey v3",
  props: {
    show: props.Visibility({ name: "Show", defaultValue: true }),
    content: props.RichText({ name: "Rich text" }),
    styleMode: props.Variant({
      name: "Style",
      options: ["standard", "article"],
      defaultValue: "standard",
    }),
    size: props.Variant({
      name: "Size",
      options: ["inherit", ...typeSizeOptions()],
      defaultValue: "inherit",
    }),
    align: props.Variant({
      name: "Align",
      options: ["inherit", ...tokenOptions("textAlign")],
      defaultValue: "inherit",
    }),
    colour: props.Variant({
      name: "Colour",
      options: tokenOptions("colour"),
      defaultValue: "inherit",
    }),
  },
});
