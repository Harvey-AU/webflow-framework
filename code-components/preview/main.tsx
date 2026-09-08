import { createRoot } from "react-dom/client";
import { SiteHeader } from "../src/kaytetye/SiteHeader";
import { HeroBanner } from "../src/kaytetye/HeroBanner";
import { WordCatalog } from "../src/kaytetye/WordCatalog";
import { ResourceBanner } from "../src/kaytetye/ResourceBanner";
import { SiteFooter } from "../src/kaytetye/SiteFooter";

/**
 * Local harness only. In Webflow each of these is a separate code component
 * dropped on the page; they coordinate through the URL, exactly as they do here.
 */
const LOREM =
  "Lorem ipsum dolor sit amet consectetur. Id tortor id est consectetur cras ultricies. Magna enim auctor scelerisque cursus consectetur vitae. Eget vitae arcu cursus ut tellus scelerisque mollis enim purus.";

function Page() {
  return (
    <div className="bg-cream min-h-screen">
      <SiteHeader />
      <HeroBanner
        body={LOREM}
        image={{ src: "/assets/hero.png", alt: "Country illustration" }}
      />
      <WordCatalog />
      <ResourceBanner
        body="Lorem ipsum dolor sit amet consectetur. Commodo sit elit at semper viverra ac eget egestas amet. Luctus quis eu interdum sed eleifend tempus."
        image={{ src: "/assets/resources.png", alt: "Desert landscape" }}
      />
      <SiteFooter />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Page />);
