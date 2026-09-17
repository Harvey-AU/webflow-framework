import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { Accordion, type AccordionProps } from "@/src/components/Accordion";
import { GLYPH_NAMES } from "@/src/icons/glyphs";
import { tokenOptions, typeSizeOptions } from "@/src/tokens";

function DeclaredAccordion({ show = true, ...rest }: AccordionProps & { show?: boolean }) {
  if (!show) return null;
  return <Accordion {...rest} />;
}

export default declareComponent(DeclaredAccordion, {
  name: "Accordion | Library",
  description:
    "One accordion/FAQ item on native details/summary — no JS, keyboard and screen-reader semantics built in. Stack items for a list. The body is the Rich Text block with identical settings. Open state swaps the background and adds a thin hr-variable border.",
  group: "Harvey v3",
  props: {
    show: props.Visibility({ name: "Show", defaultValue: true }),
    icon: props.Variant({
      name: "Icon",
      group: "Style",
      options: ["none", ...GLYPH_NAMES],
      defaultValue: "arrow-down",
      tooltip: "Flips 180° when open. None hides it (and removes the body indent).",
    }),
    iconPosition: props.Variant({
      name: "Icon position",
      group: "Style",
      options: ["before", "after"],
      defaultValue: "before",
      tooltip: "before = start of the row (body indents to the title) · after = pinned to the far right.",
    }),
    titleTag: props.Variant({
      name: "Title tag",
      group: "Style",
      options: ["h2", "h3", "h4", "h5", "h6"],
      defaultValue: "h3",
      tooltip: "SEO only — size is set separately. h3 is the FAQ convention.",
    }),
    titleSize: props.Variant({
      name: "Title size",
      group: "Style",
      options: ["inherit", ...typeSizeOptions()],
      defaultValue: "medium",
      tooltip: "inherit uses the tag's own size variables.",
    }),
    titleWeight: props.Variant({
      name: "Title weight",
      group: "Style",
      options: ["inherit", ...tokenOptions("weight")],
      defaultValue: "inherit",
    }),
    background: props.Variant({
      name: "Background",
      group: "Style",
      options: tokenOptions("colour"),
      defaultValue: "neutral-lightest",
      tooltip: "Background while closed.",
    }),
    backgroundOpen: props.Variant({
      name: "Background open",
      group: "Style",
      options: tokenOptions("colour"),
      defaultValue: "white",
      tooltip: "Background while open — the open item also gets a thin border (Border colour).",
    }),
    borderColour: props.Variant({
      name: "Border colour",
      group: "Style",
      options: ["hr", ...tokenOptions("colour")],
      defaultValue: "hr",
      tooltip:
        "Colour of the open item's border. hr = the site's divider colour variable. Inherit = current text colour.",
    }),
    corners: props.Variant({
      name: "Corners",
      group: "Style",
      options: tokenOptions("corners"),
      defaultValue: "xsmall",
    }),
    padding: props.Variant({
      name: "Padding",
      group: "Style",
      options: tokenOptions("padding"),
      defaultValue: "medium",
    }),
    bodyStyle: props.Variant({
      name: "Style",
      group: "Body",
      options: ["standard", "article"],
      defaultValue: "standard",
      tooltip: "Same as Rich Text: article swaps divider styling to the article variables.",
    }),
    bodySize: props.Variant({
      name: "Size",
      group: "Body",
      options: ["inherit", ...typeSizeOptions()],
      defaultValue: "inherit",
    }),
    bodyAlign: props.Variant({
      name: "Align",
      group: "Body",
      options: ["inherit", ...tokenOptions("textAlign")],
      defaultValue: "inherit",
    }),
    bodyColour: props.Variant({
      name: "Colour",
      group: "Body",
      options: tokenOptions("colour"),
      defaultValue: "inherit",
    }),
    title: props.TextNode({ name: "Title", group: "Content", defaultValue: "Question" }),
    body: props.RichText({
      name: "Body",
      group: "Content",
      defaultValue:
        "This is the answer. Swap it with your own copy — formatting, links and lists all work, exactly as in the Rich Text block.",
    }),
    startOpen: props.Boolean({
      name: "Start open",
      group: "Content",
      defaultValue: false,
      tooltip:
        "Renders the item open on load (the usual first-FAQ pattern). Also the canvas affordance: flip on to edit the body in the Designer, since design-mode clicks select rather than toggle.",
    }),
  },
});
