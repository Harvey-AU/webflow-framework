import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Accordion } from "../src/components/Accordion";
import { Heading } from "../src/components/Heading";
import { Text } from "../src/components/Text";
import { Stack } from "../src/components/Stack";
import { Spacer } from "../src/components/Spacer";

/** Accordion harness — the Figma FAQ composition, then the setting axes. */

const faqs: Array<{ q: string; a: ReactNode }> = [
  {
    q: "What is the Harvey component library?",
    a: (
      <>
        <p>
          A shared set of Webflow code components — blocks and small molecules — that every
          Harvey client site installs from one library. Sites theme them entirely through
          their own Webflow variables.
        </p>
        <p>
          The body here is the real <a href="#">Rich Text block</a>, so lists, links and
          dividers all behave identically.
        </p>
      </>
    ),
  },
  {
    q: "How do accordions work without JavaScript?",
    a: (
      <p>
        Native <code>&lt;details&gt;/&lt;summary&gt;</code> — the browser owns the open
        state, keyboard toggling and screen-reader semantics. The icon flip is pure CSS.
      </p>
    ),
  },
  {
    q: "Can the FAQ list come from the CMS?",
    a: (
      <p>
        Yes — wrap the native accordion component instance in a Collection List and bind
        Title and Body to collection fields.
      </p>
    ),
  },
];

function App() {
  return (
    <>
      <h1>v3 Accordion</h1>

      <h2>FAQ composition (per the Figma — first item open)</h2>
      <div className="frame" style={{ maxWidth: 720 }}>
        <Heading text="Frequently asked questions" size="xlarge" />
        <Text text="Everything you need to know about the component library." />
        <Spacer size="xxsmall" />
        <Stack>
          {faqs.map((f, i) => (
            <div key={f.q} style={{ marginTop: i === 0 ? 0 : "0.75rem" }}>
              <Accordion title={f.q} body={f.a} startOpen={i === 0} />
            </div>
          ))}
        </Stack>
      </div>

      <h2>Icon after (pinned right, body at padding edge)</h2>
      <div className="frame" style={{ maxWidth: 720 }}>
        <Accordion
          title="Icon position: after"
          iconPosition="after"
          startOpen
          body={<p>With the icon after, the body aligns to the left padding edge with the title.</p>}
        />
      </div>

      <h2>Axes — plus glyph, tag sizes, colours, article body</h2>
      <div className="frame" style={{ maxWidth: 720 }}>
        <Accordion
          title="Plus icon, small corners, brand-2 → white, brand-3 border"
          icon="plus"
          corners="small"
          background="brand-2"
          borderColour="brand-3"
          startOpen
          body={<p>Backgrounds are two settings: closed and open; the open border colour is its own setting (default hr).</p>}
        />
        <div style={{ marginTop: "0.75rem" }}>
          <Accordion
            title="h2 tag at inherit size, bold, article body with divider"
            titleTag="h2"
            titleSize="inherit"
            titleWeight="bold"
            bodyStyle="article"
            padding="small"
            startOpen
            body={
              <>
                <p>Article style swaps the hr variables.</p>
                <hr />
                <p>After the divider.</p>
              </>
            }
          />
        </div>
        <div style={{ marginTop: "0.75rem" }}>
          <Accordion title="No icon, closed by default — click me" icon="none" />
        </div>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
