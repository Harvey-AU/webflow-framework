import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { HeroBanner } from "./HeroBanner";

export default declareComponent(HeroBanner, {
  name: "Hero Banner",
  description: "Theme page hero: breadcrumb, title, gloss and intro copy on Country red.",
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
  },
});
