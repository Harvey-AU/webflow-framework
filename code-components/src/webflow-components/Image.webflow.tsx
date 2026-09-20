import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { HiddenPlaceholder } from "./HiddenPlaceholder";
import {
  Image,
  RATIO_OPTIONS,
  MAX_WIDTH_OPTIONS,
  type ImageProps,
} from "@/src/components/Image";
import { tokenOptions } from "@/src/tokens";

function DeclaredImage({ show = true, ...rest }: ImageProps & { show?: boolean }) {
  if (!show) return <HiddenPlaceholder />;
  return <Image {...rest} />;
}

export default declareComponent(DeclaredImage, {
  name: "Image | Library",
  description:
    "Image block. Alt text comes from the asset. Fit contain protects logos from cropping; Loading eager is for above-the-fold heroes (LCP).",
  group: "Harvey v3",
  props: {
    show: props.Visibility({ name: "Show", defaultValue: true }),
    image: props.Image({ name: "Image" }),
    imageMobile: props.Image({
      name: "Image mobile",
      tooltip: "Optional different asset below 767px. Empty = the main image everywhere.",
    }),
    ratio: props.Variant({
      name: "Ratio",
      options: [...RATIO_OPTIONS],
      defaultValue: "auto",
    }),
    fit: props.Variant({
      name: "Fit",
      options: ["cover", "contain"],
      defaultValue: "cover",
      tooltip: "Contain for logos and product shots — cover crops.",
    }),
    corners: props.Variant({
      name: "Corners",
      options: tokenOptions("corners"),
      defaultValue: "none",
    }),
    maxWidth: props.Variant({
      name: "Max width",
      options: [...MAX_WIDTH_OPTIONS],
      defaultValue: "100",
    }),
    widthPx: props.Number({
      name: "Width px",
      defaultValue: 0,
      min: 0,
      max: 2000,
      decimals: 0,
      tooltip: "Fixed pixel width for logos and icons. 0 = fill the container.",
    }),
    widthPxMobile: props.Number({
      name: "Mobile width px",
      defaultValue: 0,
      min: 0,
      max: 2000,
      decimals: 0,
      tooltip: "Overrides Width px below 767px. 0 = no override.",
    }),
    align: props.Variant({
      name: "Align",
      options: ["left", "center", "right"],
      defaultValue: "center",
      tooltip: "Matters when Max width is under 100.",
    }),
    loading: props.Variant({
      name: "Loading",
      options: ["lazy", "eager"],
      defaultValue: "lazy",
      tooltip: "Eager for above-the-fold hero images.",
    }),
    customStyle: props.Text({
      name: "Custom style",
      defaultValue: "",
      tooltip:
        "Escape hatch: inline CSS overrides, e.g. \"opacity: .8; mix-blend-mode: multiply\". If you use the same override twice, ask for a real setting.",
    }),
  },
});
