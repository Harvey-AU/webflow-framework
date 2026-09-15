import type { CSSProperties, ReactNode } from "react";
import {
  tokenValue,
  type PaddingOption,
  type GuttersOption,
  type ColourOption,
  type CornersOption,
} from "@/src/tokens";

/**
 * v3 Container — layout box with a slot, styled entirely from the shared token
 * vocabulary in `src/tokens`. Defaults mirror the v2 `Attr | Container` base
 * variant, so an instance with nothing set renders the same as v2's default.
 */
export type ContainerProps = {
  paddingTop?: PaddingOption;
  paddingBottom?: PaddingOption;
  gutters?: GuttersOption;
  background?: ColourOption;
  textColour?: ColourOption;
  corners?: CornersOption;
  children?: ReactNode;
};

/**
 * Structure mirrors v2's split: background and vertical padding on the
 * full-bleed outer box, gutters on the inner wrapper that holds the content —
 * so a future Container width prop constrains the content, not the box.
 */
export function Container({
  paddingTop = "large",
  paddingBottom = "large",
  gutters = "standard",
  background = "transparent",
  textColour = "inherit",
  corners = "none",
  children,
}: ContainerProps) {
  const outer: CSSProperties = {
    display: "block",
    width: "100%",
    paddingTop: tokenValue("padding", paddingTop),
    paddingBottom: tokenValue("padding", paddingBottom),
    backgroundColor: tokenValue("colour", background),
    color: tokenValue("colour", textColour),
    borderRadius: tokenValue("corners", corners),
  };
  const inner: CSSProperties = {
    paddingLeft: tokenValue("gutters", gutters),
    paddingRight: tokenValue("gutters", gutters),
  };
  return (
    <section style={outer}>
      <div style={inner}>{children}</div>
    </section>
  );
}
