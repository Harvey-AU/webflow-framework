import { createRoot } from "react-dom/client";
import { Heading } from "../src/components/Heading";
import { Text } from "../src/components/Text";
import { Icon } from "../src/components/Icon";
import { Button } from "../src/components/Button";
import { Tag } from "../src/components/Tag";
import { Image } from "../src/components/Image";
import { RichText } from "../src/components/RichText";
import { Breadcrumb } from "../src/components/Breadcrumb";
import { HorizontalLine } from "../src/components/HorizontalLine";
import { GLYPH_NAMES } from "../src/icons/glyphs";

/** One-page gallery of the typography tier — morning review harness. */

const IMG = "https://picsum.photos/seed/harvey/800/500";

function App() {
  return (
    <>
      <h1>v3 Blocks gallery</h1>

      <h2>Heading — sizes, decoration</h2>
      <div className="frame">
        <Heading text="h2 default (inherit size)" />
        <Heading text="h2 sized huge" size="huge" />
        <Heading text="underline-2" size="large" decoration="underline-2" />
        <Heading text="strike-through" size="large" decoration="strike-through" />
        <Heading text="centered xbold" size="medium" weight="xbold" align="center" />
      </div>

      <h2>Text — sizes, icon</h2>
      <div className="frame">
        <Text text="Default paragraph (p size). Lorem ipsum dolor sit amet, consectetur adipiscing elit." />
        <Text text="Small with icon after" size="small" icon="arrow-stem-right" />
        <Text text="underline-1 decorated" decoration="underline-1" />
      </div>

      <h2>Icon — glyph wall (weight 1.25)</h2>
      <p className="note">Filled glyphs ignore Weight; line glyphs respond to it.</p>
      <div className="frame row">
        {GLYPH_NAMES.map((g) => (
          <span key={g} title={g} style={{ fontSize: 20 }}>
            <Icon glyph={g} />
          </span>
        ))}
      </div>
      <div className="frame row">
        <span>weight 0.75 <Icon glyph="arrow-stem-up-right" size="large" weight={0.75} /></span>
        <span>1.25 <Icon glyph="arrow-stem-up-right" size="large" /></span>
        <span>2.5 <Icon glyph="arrow-stem-up-right" size="large" weight={2.5} /></span>
      </div>

      <h2>Button — colour ways (hover them)</h2>
      <p className="note">outline/text/no-fill hover behaviour is ASSUMED pending v2 stylesheet check.</p>
      <div className="frame row">
        <Button text="standard + icon" icon="arrow-stem-up-right" />
        <Button text="colour-2" colour="colour-2" icon="arrow-stem-up-right" />
        <Button text="colour-3" colour="colour-3" />
        <Button text="outline-4" colour="outline-4" />
        <Button text="outline-no-fill-1" colour="outline-no-fill-1" />
        <Button text="hover-5" colour="hover-5" />
        <Button text="text-4" colour="text-4" icon="arrow-stem-right" />
        <Button text="pill" colour="colour-2" corners="full" />
        <Button text="short, default no icon" size="short" />
      </div>

      <h2>Tag</h2>
      <div className="frame row">
        <Tag text="standard" />
        <Tag text="colour-2 pill" colour="colour-2" corners="full" iconBefore="check-mark" />
        <Tag text="outline-4" colour="outline-4" size="short-narrow" iconAfter="close" />
      </div>

      <h2>HorizontalLine — hr defaults, then thick brand</h2>
      <div className="frame">
        <Text text="Above the default line" />
        <HorizontalLine />
        <Text text="Between lines" />
        <HorizontalLine thickness="large" colour="brand-3" spacerAbove="xsmall" spacerBelow="xsmall" />
        <Text text="Below the thick amber line" />
      </div>

      <h2>Breadcrumb</h2>
      <div className="frame">
        <Breadcrumb
          homeLink={{ href: "#" }}
          item1Text="Resources"
          item1Link={{ href: "#" }}
          showItem2
          item2Text="Guides"
        />
      </div>

      <h2>Image — ratio/fit/corners/max-width/width px (last: 200px, 100px under 767)</h2>
      <div className="frame row">
        <div style={{ width: 260 }}>
          <Image image={{ src: IMG, alt: "demo" }} ratio="1x1" corners="small" />
        </div>
        <div style={{ width: 260 }}>
          <Image image={{ src: IMG, alt: "demo" }} ratio="16x9" fit="contain" corners="none" />
        </div>
        <div style={{ width: 260 }}>
          <Image image={{ src: IMG, alt: "demo" }} maxWidth="50" align="right" customStyle="opacity: .6; border: 2px dashed #be2078" />
        </div>
        <div style={{ width: 260 }}>
          <Image image={{ src: IMG, alt: "demo" }} widthPx={200} widthPxMobile={100} ratio="1x1" corners="small" />
        </div>
      </div>

      <h2>RichText — standard vs article (hr styling differs)</h2>
      <div className="frame row" style={{ alignItems: "flex-start" }}>
        {(["standard", "article"] as const).map((mode) => (
          <div key={mode} style={{ flex: "1 1 300px" }}>
            <RichText
              styleMode={mode}
              content={
                <>
                  <h3>{mode}</h3>
                  <p>First paragraph — top margin should be trimmed.</p>
                  <hr />
                  <p>After the divider. <a href="#">A link in currentColor</a>.</p>
                </>
              }
            />
          </div>
        ))}
      </div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
