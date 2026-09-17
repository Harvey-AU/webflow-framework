import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { RichText, type RichTextProps } from "@/src/components/RichText";
import { tokenOptions, typeSizeOptions } from "@/src/tokens";

function DeclaredRichText({ show = true, ...rest }: RichTextProps & { show?: boolean }) {
  if (!show) return null;
  return <RichText {...rest} />;
}

export default declareComponent(DeclaredRichText, {
  name: "Rich Text | Library",
  description:
    "Rich text block. Style article swaps the divider styling to the article variables, as v1's two rich text classes did.",
  group: "Harvey v3",
  props: {
    show: props.Visibility({ name: "Show", defaultValue: true }),
    styleMode: props.Variant({
      name: "Style",
      group: "Style",
      options: ["standard", "article"],
      defaultValue: "standard",
    }),
    size: props.Variant({
      name: "Size",
      group: "Style",
      options: ["inherit", ...typeSizeOptions()],
      defaultValue: "inherit",
    }),
    align: props.Variant({
      name: "Align",
      group: "Style",
      options: ["inherit", ...tokenOptions("textAlign")],
      defaultValue: "inherit",
    }),
    colour: props.Variant({
      name: "Colour",
      group: "Style",
      options: tokenOptions("colour"),
      defaultValue: "inherit",
    }),
    content: props.RichText({
      name: "Rich text",
      group: "Content",
      defaultValue:
        "This is a rich text box. Swap this content with your own, and use the settings to change the style, size, alignment and colour.",
    }),
  },
});
