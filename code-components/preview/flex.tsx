import { createRoot } from "react-dom/client";
import { Flex } from "../src/components/Flex";

const Btn = ({ label, h }: { label: string; h?: number }) => (
  <div style={{ background: "#56266c", color: "#fff", padding: "0.75rem 1.5rem", height: h }}>
    {label}
  </div>
);

createRoot(document.getElementById("root")!).render(
  <>
    <h1>v3 Flex</h1>

    <h2>Row (default), gap small — taller item shows cross-axis centring</h2>
    <div className="frame">
      <Flex>
        <Btn label="Primary" h={64} />
        <Btn label="Secondary" />
      </Flex>
    </div>

    <h2>Direction mobile L = column</h2>
    <p className="note">Row on desktop; below 767px the buttons stack and stretch full width.</p>
    <div className="frame">
      <Flex directionMobileL="column">
        <Btn label="Primary" />
        <Btn label="Secondary" />
      </Flex>
    </div>

    <h2>Column — children stretch</h2>
    <div className="frame">
      <Flex direction="column">
        <Btn label="one" />
        <Btn label="two" />
      </Flex>
    </div>

    <h2>Wrap on vs off (default), gap tiny — 12 items</h2>
    <p className="note">First row wraps onto new lines; second (default no-wrap) squeezes on one line.</p>
    <div className="frame">
      <Flex gap="tiny" wrap="wrap">
        {Array.from({ length: 12 }, (_, i) => <Btn key={i} label={`tag ${i + 1}`} />)}
      </Flex>
      <div style={{ height: 12 }} />
      <Flex gap="tiny">
        {Array.from({ length: 12 }, (_, i) => <Btn key={i} label={`tag ${i + 1}`} />)}
      </Flex>
    </div>
  </>,
);
