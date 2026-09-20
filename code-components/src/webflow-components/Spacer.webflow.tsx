import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { HiddenPlaceholder } from "./HiddenPlaceholder";
import { Spacer, type SpacerProps } from "@/src/components/Spacer";
import { tokenOptions } from "@/src/tokens";

function DeclaredSpacer({ show = true, ...rest }: SpacerProps & { show?: boolean }) {
  if (!show) return <HiddenPlaceholder />;
  return <Spacer {...rest} />;
}

export default declareComponent(DeclaredSpacer, {
  name: "Spacer | Library",
  description:
    "Explicit space between blocks — use inside Stack instead of gaps so spacing stays visible in the tree. Note the scale runs big: small is 3rem on the library.",
  group: "Harvey v3",
  props: {
    show: props.Visibility({ name: "Show", defaultValue: true }),
    size: props.Variant({
      name: "Size",
      options: tokenOptions("spacer"),
      defaultValue: "small",
      tooltip: "Library values: xxsmall 1.5rem, xsmall 2rem, small 3rem, medium 5rem, large 8rem, xlarge 12rem, huge 16rem.",
    }),
    sizeMobileL: props.Variant({
      name: "Size mobile",
      options: ["inherit", ...tokenOptions("spacer")],
      defaultValue: "inherit",
      tooltip: "Override below 767px. Inherit keeps the main size.",
    }),
    axis: props.Variant({
      name: "Axis",
      options: ["vertical", "horizontal"],
      defaultValue: "vertical",
    }),
  },
});
