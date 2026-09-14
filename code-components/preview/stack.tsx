import { createRoot } from "react-dom/client";
import { Stack } from "../src/components/Stack";

const Box = ({ label, w }: { label: string; w?: number }) => (
  <div style={{ background: "#114e0b", color: "#fff", padding: "0.5rem 1rem", width: w }}>
    {label}
  </div>
);
// Stand-in for the future Spacer block.
const FakeSpacer = () => <div style={{ height: "1rem" }} />;

createRoot(document.getElementById("root")!).render(
  <>
    <h1>v3 Stack</h1>
    <h2>stretch (default) — children fill the width</h2>
    <div className="frame">
      <Stack>
        <Box label="one" />
        <FakeSpacer />
        <Box label="two" />
      </Stack>
    </div>
    <h2>start / center / end — children keep natural width</h2>
    <div className="frame">
      <Stack alignment="start"><Box label="start" w={160} /></Stack>
      <Stack alignment="center"><Box label="center" w={160} /></Stack>
      <Stack alignment="end"><Box label="end" w={160} /></Stack>
    </div>
  </>,
);
