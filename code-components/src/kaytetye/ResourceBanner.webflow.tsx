import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { ResourceBanner } from "./ResourceBanner";

export default declareComponent(ResourceBanner, {
  name: "Resource Banner",
  description: "Sky-blue call-out with a round image, heading, copy and a button.",
  group: "Kaytetye",
  props: {
    heading: props.Text({ name: "Heading", group: "Content", defaultValue: "Other resources" }),
    body: props.Text({ name: "Body", group: "Content", defaultValue: "" }),
    ctaLabel: props.Text({ name: "Button label", group: "Content", defaultValue: "Learn more" }),
    cta: props.Link({ name: "Button link", group: "Content" }),
    image: props.Image({ name: "Image", group: "Content" }),
  },
});
