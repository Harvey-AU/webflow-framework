import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { SiteHeader } from "./SiteHeader";

export default declareComponent(SiteHeader, {
  name: "Site Header",
  description: "Wordmark and navigation bar. Leave the Nav slot empty to use the default links.",
  group: "Kaytetye",
  props: {
    wordmark: props.Text({ name: "Wordmark", defaultValue: "Kaytetye" }),
    home: props.Link({ name: "Wordmark link" }),
    nav: props.Slot({ name: "Nav", tooltip: "Drop Webflow link blocks here." }),
  },
});
