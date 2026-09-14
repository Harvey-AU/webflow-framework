import { createRoot } from "react-dom/client";
import { Grid } from "../src/components/Grid";

/**
 * Grid preview harness. Resize the window to check the breakpoint behaviour —
 * the interesting transitions are at 991px and 767px.
 */

const COLOURS = ["#ffb200", "#114e0b", "#be2078", "#56266c", "#3b6559", "#e76f51"];

function Box({ n, h }: { n: number; h?: number }) {
  return (
    <div
      style={{
        background: COLOURS[(n - 1) % COLOURS.length],
        color: "#fff",
        padding: "1rem",
        minHeight: h ?? 60,
        fontSize: 20,
      }}
    >
      {n}
    </div>
  );
}

const boxes = (count: number) =>
  Array.from({ length: count }, (_, i) => <Box key={i} n={i + 1} />);

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <>
      <h2>{title}</h2>
      {note && <p className="note">{note}</p>}
      <div className="frame">{children}</div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <>
    <h1>v3 Grid</h1>

    <Section title="Defaults — nothing set" note="two-50-50, medium gaps, center. Below 767px it should stack to one column automatically.">
      <Grid>{boxes(2)}</Grid>
    </Section>

    <Section title="three columns, 6 items">
      <Grid columns="three">{boxes(6)}</Grid>
    </Section>

    <Section title="two-60-40">
      <Grid columns="two-60-40">{boxes(2)}</Grid>
    </Section>

    <Section title="Direction reverse — mirrored columns" note="1 should render on the RIGHT. Below 767px it stacks and un-reverses (reverse came from desktop), so 1 is back on top.">
      <Grid direction="reverse">{boxes(2)}</Grid>
    </Section>

    <Section title="Direction tablet = reverse" note="Desktop: 1 left. 767–991px: mirrored, 1 right. Below 767px: stacked with 2 ON TOP (explicit breakpoint reverse survives the stack).">
      <Grid directionTablet="reverse">{boxes(2)}</Grid>
    </Section>

    <Section title="Columns mobile L = two-50-50" note="Stays two columns below 767px instead of auto-stacking.">
      <Grid columnsMobileL="two-50-50">{boxes(4)}</Grid>
    </Section>

    <Section title="Gaps — column tiny / row xlarge">
      <Grid columns="three" columnGap="tiny" rowGap="xlarge">{boxes(6)}</Grid>
    </Section>

    <Section title="Vertical alignment with unequal heights" note="center (default): short box sits mid-height of the tall one. Then stretch: both fill.">
      <Grid>
        <Box n={1} h={160} />
        <Box n={2} />
      </Grid>
      <div style={{ height: 12 }} />
      <Grid valign="stretch">
        <Box n={1} h={160} />
        <Box n={2} />
      </Grid>
    </Section>

    <Section title="4+ children reversed — the v1 bug check" note="Six items mirrored: should read 3/2/1 then 6/5/4 by row, no item jumping to the front.">
      <Grid columns="three" direction="reverse">{boxes(6)}</Grid>
    </Section>
  </>,
);
