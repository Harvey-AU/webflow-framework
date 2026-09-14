import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { Stack, type StackProps } from "@/src/components/Stack";
import { tokenOptions } from "@/src/tokens";

function DeclaredStack({ show = true, ...rest }: StackProps & { show?: boolean }) {
  if (!show) return null;
  return <Stack {...rest} />;
}

export default declareComponent(DeclaredStack, {
  name: "Stack",
  description:
    "Vertical column of blocks. Space children with Spacer blocks so spacing stays visible in the tree. Alignment sets the children's horizontal alignment.",
  group: "Harvey v3",
  props: {
    show: props.Visibility({ name: "Show", defaultValue: true }),
    alignment: props.Variant({
      name: "Alignment",
      options: tokenOptions("alignment"),
      defaultValue: "stretch",
    }),
    children: props.Slot({ name: "Content" }),
  },
});
