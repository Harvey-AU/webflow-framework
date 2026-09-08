import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { SiteFooter } from "./SiteFooter";

export default declareComponent(SiteFooter, {
  name: "Site Footer",
  description: "Country-red footer with the wordmark, acknowledgement of Country and policy links.",
  group: "Kaytetye",
  props: {
    wordmark: props.Text({ name: "Wordmark", defaultValue: "Kaytetye" }),
    broughtToYouBy: props.Text({ name: "Attribution", defaultValue: "Brought to you by" }),
    acknowledgement: props.Text({ name: "Acknowledgement", defaultValue: "" }),
    termsLabel: props.Text({ name: "Terms label", defaultValue: "Terms & Policies" }),
    terms: props.Link({ name: "Terms link" }),
    copyright: props.Text({ name: "Copyright", defaultValue: "© Kaytetye" }),
  },
});
