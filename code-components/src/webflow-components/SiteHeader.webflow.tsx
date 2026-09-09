import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { SiteHeader, type SiteHeaderProps } from "@/src/components/SiteHeader";
import { NAV_ITEMS } from "@/src/config/site";
import type { NavData } from "@/src/lib/queries";
import navFunction from "@/src/webflow-functions/nav.webflow.function";
import { useQuery } from "./use-query";

/**
 * The call site: run the query, hand the result to the component.
 *
 * `SiteHeader` itself takes links as a prop and knows nothing about Webflow, so
 * the CMS read lives here. `NAV_ITEMS` is the fallback for an empty or
 * unpublished `Nav Items` collection, which would otherwise blank the header.
 */
function ConnectedSiteHeader(headerProps: Omit<SiteHeaderProps, "navItems">) {
  const { nav } = useQuery<NavData>("kaytetye:nav", navFunction, { nav: NAV_ITEMS });
  return <SiteHeader {...headerProps} navItems={nav.length ? nav : NAV_ITEMS} />;
}

export default declareComponent(ConnectedSiteHeader, {
  name: "Site Header",
  description: "Wordmark and navigation bar. Links come from the Nav Items collection.",
  group: "Kaytetye",
  props: {
    wordmark: props.Text({ name: "Wordmark", defaultValue: "Kaytetye" }),
    home: props.Link({ name: "Wordmark link" }),
    nav: props.Slot({ name: "Nav", tooltip: "Drop Webflow link blocks here to override the CMS." }),
  },
  // The nav comes from the CMS through a Code Function; prerendering it keeps
  // the links in the served HTML instead of popping in after hydration.
  options: { ssr: "prerender" },
});
