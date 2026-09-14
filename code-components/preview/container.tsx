import { createRoot } from "react-dom/client";
import { Container } from "../src/components/Container";
import {
  tokenOptions,
  type PaddingOption,
  type ColourOption,
} from "../src/tokens";

/**
 * Container preview harness. The token variables come from the <style> stub in
 * container.html (values copied from the library site), with a second theme
 * scope to prove the component re-skins from variables alone.
 */

const label = (text: string) => (
  <p style={{ margin: 0, fontFamily: "monospace", fontSize: 13 }}>{text}</p>
);

function Demos() {
  return (
    <>
      <h2 style={{ fontFamily: "monospace" }}>Defaults (nothing set)</h2>
      <div className="outline">
        <Container>{label("padding large / gutters standard / bg transparent / text inherit")}</Container>
      </div>

      <h2 style={{ fontFamily: "monospace" }}>Background + text colour</h2>
      <Container background="brand-1" textColour="white" paddingTop="medium" paddingBottom="medium">
        {label("bg brand-1, text white")}
      </Container>
      <Container background="brand-4" textColour="neutral-darkest" paddingTop="medium" paddingBottom="medium">
        {label("bg brand-4, text neutral-darkest")}
      </Container>
      <Container background="neutral-lightest" paddingTop="medium" paddingBottom="medium">
        {label("bg neutral-lightest, text inherit")}
      </Container>

      <h2 style={{ fontFamily: "monospace" }}>Gutters none vs standard</h2>
      <Container background="brand-3" paddingTop="small" paddingBottom="small" gutters="none">
        {label("gutters none — text touches the edge")}
      </Container>
      <Container background="brand-3" paddingTop="small" paddingBottom="small">
        {label("gutters standard — 2.5rem side padding")}
      </Container>

      <h2 style={{ fontFamily: "monospace" }}>Padding scale</h2>
      {(["zero", "xsmall", "medium", "large", "xhuge"] as PaddingOption[]).map((p) => (
        <Container key={p} background="neutral-lightest" paddingTop={p} paddingBottom={p}>
          {label(`padding ${p}`)}
        </Container>
      ))}

      <h2 style={{ fontFamily: "monospace" }}>Full swatch row (every colour option)</h2>
      {tokenOptions("colour").filter((c) => c !== "inherit").map((c: ColourOption) => (
        <Container
          key={c}
          background={c}
          textColour={c === "neutral-darkest" || c === "black" || c === "brand-1" ? "white" : "inherit"}
          paddingTop="xtiny"
          paddingBottom="xtiny"
        >
          {label(c)}
        </Container>
      ))}

      <p style={{ fontFamily: "monospace", fontSize: 12 }}>
        Padding options wired: {tokenOptions("padding").join(", ")}
      </p>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <>
    <h1 style={{ fontFamily: "monospace" }}>Theme A — library defaults</h1>
    <Demos />
    <div className="theme-caf">
      <h1 style={{ fontFamily: "monospace" }}>Theme B — CAF-ish overrides (same components)</h1>
      <Demos />
    </div>
  </>,
);
