import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { HeroBanner } from "./HeroBanner";

export default declareComponent(HeroBanner, {
  name: "Hero Banner",
  description: "Country-red banner: optional breadcrumb, title, gloss, intro copy, optional button and illustration.",
  group: "Kaytetye",
  props: {
    breadcrumb: props.Text({
      name: "Breadcrumb",
      group: "Content",
      tooltip: "Slash-separated, e.g. Home / Words / Apmere",
      defaultValue: "Home / Words / Apmere",
    }),
    title: props.Text({ name: "Title", group: "Content", defaultValue: "Apmere" }),
    subtitle: props.Text({ name: "Gloss", group: "Content", defaultValue: "(Country)" }),
    body: props.Text({ name: "Intro", group: "Content", defaultValue: "" }),
    image: props.Image({ name: "Illustration", group: "Content" }),
    ctaLabel: props.Text({
      name: "Button label",
      group: "Content",
      tooltip: "Leave empty for no button.",
      defaultValue: "",
    }),
    cta: props.Link({ name: "Button link", group: "Content" }),
  },
});
