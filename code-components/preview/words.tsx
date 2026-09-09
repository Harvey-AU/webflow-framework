import { createRoot } from "react-dom/client";
import {
  SiteHeader,
  HeroBanner,
  WordCatalog,
  ResourceBanner,
  SiteFooter,
} from "../src/components";
import { NAV_ITEMS } from "../src/config/site";
import { FALLBACK_CATALOG } from "../src/config/fallback-catalog";

/**
 * Local harness only. In Webflow each of these is a separate code component
 * dropped on the page; they coordinate through the URL, exactly as they do here.
 *
 * This is the second call site, and the reason the components take their data
 * as props: in Webflow the words come from `catalogQuery` over the CMS, here
 * they come from a file, and neither component can tell the difference.
 */
const LOREM =
  "Lorem ipsum dolor sit amet consectetur. Id tortor id est consectetur cras ultricies. Magna enim auctor scelerisque cursus consectetur vitae. Eget vitae arcu cursus ut tellus scelerisque mollis enim purus.";

function Page() {
  return (
    <div className="bg-cream min-h-screen">
      <SiteHeader navItems={NAV_ITEMS} />
      <HeroBanner
        body={LOREM}
        image={{ src: "/assets/hero.png", alt: "Country illustration" }}
      />
      <WordCatalog entries={FALLBACK_CATALOG.entries} themeTree={FALLBACK_CATALOG.themeTree} />
      <ResourceBanner
        body="Lorem ipsum dolor sit amet consectetur. Commodo sit elit at semper viverra ac eget egestas amet. Luctus quis eu interdum sed eleifend tempus."
        image={{ src: "/assets/resources.png", alt: "Desert landscape" }}
      />
      <SiteFooter />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Page />);
