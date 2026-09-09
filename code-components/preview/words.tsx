import { createRoot } from "react-dom/client";
import {
  SiteHeader,
  HeroBanner,
  WordCatalog,
  ResourceBanner,
  SiteFooter,
} from "../src/components";
import { NAV_ITEMS } from "../src/config/site";
import type { Entry } from "../src/lib/catalog-types";
import { ENTRIES, THEME_TREE } from "../src/data/words";

/**
 * Local harness only. In Webflow each of these is a separate code component
 * dropped on the page; they coordinate through the URL, exactly as they do here.
 *
 * This is the second call site, and the reason the components take their data
 * as props: in Webflow the words come from `catalogQuery` over the CMS, here
 * they come from a file, and neither component can tell the difference.
 */
/**
 * The source file keeps the two community sources apart (a 1997 definition and
 * a recorded story are different things); the catalog only needs "some prose"
 * and "an example", so the mapping happens here rather than in the component.
 */
const ENTRIES_FOR_CATALOG: Entry[] = ENTRIES.map((e) => ({
  slug: e.slug,
  word: e.word,
  gloss: e.gloss,
  scientific: e.scientific,
  image: e.image,
  audio: e.audio,
  definition: e.defEnglish || e.defKaytetye,
  examples: e.storyEnglish || e.storyKaytetye,
  themes: e.themes,
}));

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
      <WordCatalog entries={ENTRIES_FOR_CATALOG} themeTree={THEME_TREE} />
      <ResourceBanner
        body="Lorem ipsum dolor sit amet consectetur. Commodo sit elit at semper viverra ac eget egestas amet. Luctus quis eu interdum sed eleifend tempus."
        image={{ src: "/assets/resources.png", alt: "Desert landscape" }}
      />
      <SiteFooter />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Page />);
