import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { FeatureGrid } from "@/src/components/FeatureGrid";

export default declareComponent(FeatureGrid, {
  name: "Feature Grid",
  description: "Home page theme strip: heading, gloss, View all link and a row of Feature Cards.",
  group: "Kaytetye",
  props: {
    title: props.Text({ name: "Title", group: "Content", defaultValue: "Apmere" }),
    subtitle: props.Text({ name: "Gloss", group: "Content", defaultValue: "(Country)" }),
    viewAllLabel: props.Text({ name: "View all label", group: "Content", defaultValue: "View all" }),
    viewAll: props.Link({ name: "View all link", group: "Content" }),
    columns: props.Number({ name: "Columns", group: "Layout", defaultValue: 4 }),
    cards: props.Slot({ name: "Cards", tooltip: "Drop Feature Cards or a Collection List here." }),
  },
});
