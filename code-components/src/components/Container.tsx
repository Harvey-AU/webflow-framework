import type { CSSProperties, ReactNode } from "react";
import {
  tokenValue,
  type PaddingOption,
  type GuttersOption,
  type ColourOption,
  type CornersOption,
  type ContainerWidthOption,
} from "@/src/tokens";

/**
 * v3 Container — layout box with a slot, styled entirely from the shared token
 * vocabulary in `src/tokens`. Defaults mirror the v2 `Attr | Container` base
 * variant, so an instance with nothing set renders the same as v2's default.
 */
export type ContainerProps = {
  size?: ContainerWidthOption;
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
  size = "medium",
  paddingTop = "large",
  paddingBottom = "large",
  gutters = "standard",
  background = "transparent",
  textColour = "inherit",
  corners = "none",
  children,
}: ContainerProps) {
  // v1 structure: ALL padding (vertical + gutters) sits on the full-bleed
  // outer wrapper; the inner div is purely the width constraint. Gutters
  // inside the constrained box would shave 2×gutter off the content width.
  const outer: CSSProperties = {
    display: "block",
    width: "100%",
    paddingTop: tokenValue("padding", paddingTop),
    paddingBottom: tokenValue("padding", paddingBottom),
    paddingLeft: tokenValue("gutters", gutters),
    paddingRight: tokenValue("gutters", gutters),
    backgroundColor: tokenValue("colour", background),
    color: tokenValue("colour", textColour),
    borderRadius: tokenValue("corners", corners),
  };
  const inner: CSSProperties = {
    // The v1 "Container size"; "full" resolves to max-width: none.
    maxWidth: tokenValue("container", size),
    marginLeft: "auto",
    marginRight: "auto",
  };
  return (
    <section style={outer}>
      <div style={inner}>{children}</div>
    </section>
  );
}
