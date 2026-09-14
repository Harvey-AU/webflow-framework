import { createRoot } from "react-dom/client";
import { Spacer } from "../src/components/Spacer";
import { tokenOptions, type SpacerOption } from "../src/tokens";

const Bar = ({ label }: { label: string }) => (
  <div style={{ background: "#404040", color: "#fff", padding: "0.25rem 1rem" }}>{label}</div>
);
const Chip = () => (
  <div style={{ background: "#ffb200", width: 24, height: 24 }} />
);

createRoot(document.getElementById("root")!).render(
  <>
    <h1>v3 Spacer</h1>
    <h2>Vertical scale (zero → xlarge + customs; custom-3 is 90rem, scroll on)</h2>
    <div className="frame">
      {tokenOptions("spacer").map((s: SpacerOption) => (
        <div key={s}>
          <Bar label={s} />
          <Spacer size={s} />
        </div>
      ))}
      <Bar label="end" />
    </div>
    <h2>Horizontal axis in a row</h2>
    <div className="frame" style={{ display: "flex", alignItems: "center" }}>
      <Chip />
      <Spacer size="xsmall" axis="horizontal" />
      <Chip />
      <Spacer size="small" axis="horizontal" />
      <Chip />
      <Spacer size="medium" axis="horizontal" />
      <Chip />
    </div>
  </>,
);
