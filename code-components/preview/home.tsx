import { createRoot } from "react-dom/client";
import {
  SiteHeader,
  HeroBanner,
  FeatureGrid,
  FeatureCard,
  ResourceBanner,
  SiteFooter,
} from "../src/components";
import { NAV_ITEMS } from "../src/config/site";

/** Home page harness. The hero strip is a plain image - in Webflow that is a native Image block. */
const THEMES = [
  { title: "Arnanpe", gloss: "Medicinal Sap", src: "/assets/arnanpe.png" },
  { title: "Ngimarre", gloss: "Zebra Finch", src: "/assets/ngimarre.png" },
  { title: "Aylpelayte", gloss: "River Red Gum Grub", src: "/assets/aylpelayte.png" },
  { title: "Wampere", gloss: "Possum", src: "/assets/wampere.png" },
];

function Page() {
  return (
    <div className="bg-cream min-h-screen">
      <SiteHeader navItems={NAV_ITEMS} />
      <img src="/assets/home-hero.png" alt="Painting of Country" className="block h-[500px] w-full object-cover" />
      <HeroBanner
        breadcrumb=""
        title="Angke"
        subtitle="(Language)"
        body="This website lists resources in and about the Kaytetye language, a language of the Barrow Creek region of the Northern Territory. These resources are for Kaytetye people wishing to learn or teach their language, and anyone interested in learning about Kaytetye language."
        ctaLabel="Learn more"
        image={{ src: "/assets/angke.png", alt: "Kite in flight over a tree" }}
      />
      <FeatureGrid
        cards={THEMES.map((t) => (
          <FeatureCard key={t.title} title={t.title} gloss={t.gloss} image={{ src: t.src, alt: t.gloss }} />
        ))}
      />
      <ResourceBanner
        body="Lorem ipsum dolor sit amet consectetur. Commodo sit elit at semper viverra ac eget egestas amet. Luctus quis eu interdum sed eleifend tempus. Sed orci porta sed ullamcorper viverra. Vulputate scelerisque aenean vestibulum pulvinar in phasellus natoque aliquam. Id lacus."
        image={{ src: "/assets/resources.png", alt: "Desert landscape" }}
      />
      <SiteFooter />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Page />);
