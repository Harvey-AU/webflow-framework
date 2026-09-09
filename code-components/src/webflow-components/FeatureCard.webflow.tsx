import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { FeatureCard } from "@/src/components/FeatureCard";

export default declareComponent(FeatureCard, {
  name: "Feature Card",
  description: "Square image with a Kaytetye word and its gloss. Drop inside Feature Grid, bind to CMS.",
  group: "Kaytetye",
  props: {
    title: props.Text({ name: "Word", group: "Content", defaultValue: "Apmere" }),
    gloss: props.Text({ name: "Gloss", group: "Content", defaultValue: "(Country)" }),
    image: props.Image({ name: "Image", group: "Content" }),
    link: props.Link({ name: "Link", group: "Content" }),
  },
});
