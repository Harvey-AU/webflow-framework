---
name: webflow-v3-builder
description: >-
  Build and maintain Harvey's v3 Webflow code components (React components published to Webflow via the code-components CLI) for client sites such as CAF. Use this for any v3 work - writing a new component, porting a v2 attribute component, defining props, styling against Webflow variables, composing sections, migrating v1 sections to v3, or deciding whether something belongs in code. It carries the design vocabulary, prop conventions, architecture rules and hard-won platform limits from the v1 audit and the full v2 build, so a fresh session starts with the decisions already made instead of rediscovering them.
---

# Webflow v3 — code components

Handover from the v2 build (attribute-pattern components, Sept 2026). **Read `references/context-and-history.md` first if you have not built here before** — it explains why v3 exists and what was already tried and rejected. Everything below is the distilled practice.

## The one-paragraph version

Harvey has ~20 Webflow sites sharing a component library. v1 was a monolith: one "Text Image" section with **142 props**, ~99 DOM nodes per card, deep wrapper nesting. v2 replaced it with an attribute pattern — real elements plus hidden "carrier" components whose variants drive `data-*` attributes, styled by one generated stylesheet. v2 cut DOM nodes ~86% and worked, but every style option needed a hand-wired Designer "conditional", and the CSS had to be distributed to every site. **v3 moves the same design system into Webflow code components**, where a dropdown is `props.Variant(...)`, styles ship inside the bundle, and there are no conditionals at all.

## The layer model (decided 2026-09-11)

- **Sub-atoms = Webflow variables**, per site. `tokens.json` in the code project is only the code's index into them, not the source of truth.
- **The library ships atoms and molecules ONLY**: blocks (Heading, Text, Image, Spacer, Icon, RichText), layout primitives (Container, Grid, Stack, Flex), small molecules (Button, Tag, Breadcrumb, card patterns). **The library stops below sections.**
- **Organisms (full sections) are NEVER library code.** They live in the SITE TEMPLATE that new client sites are duplicated from — pre-built there as native Designer components composed from library molecules, as client boilerplate. After duplication, new sections are assembled per design (from the Figma) by composing molecules on the site.
- **Rule of three**: an organism essentially identical on a third site may be promoted to a thin slot-based library composition (layout + slots, no content props — "no modes" keeps it thin). Never pre-emptively.
- Rationale: v1's 142-prop disaster was a library organism. Organisms are where site variation concentrates; shared ones must grow a switch per site's whim. Site-side organisms are native Designer components — no per-site code, fully editable, still SSR.
- Consequence: `TextAndImage` / `CardGrid` are NOT library builds — their trees in `component-spec.md` are assembly recipes for the template.

## The Kaytetye spike is not a style reference

`code-components/` in this repo (the "Kaytetye" library) was a throwaway trial of the code-components CLI, built before these rules existed. It hardcodes everything via Tailwind/shadcn — the opposite of rule 10. Decision (2026-09-11): it stays as-is, **do not refactor it**, and do not copy its styling conventions into v3 library components. What it *is* good for: the CLI/runtime mechanics its README documents — Shadow DOM per instance (why cross-component state goes through the URL), Radix portals needing a `container` inside the shadow root, `library.globals` as the only stylesheet route, the `.cjs` bundleConfig requirement, Node 22.13+ and the workspace-plan requirement for installing libraries.

## Non-negotiable rules

1. **Everything is a block; sections are compositions.** v1's failure was a section owning 142 props. Blocks (Heading, Text, Button, Image…) are small and reusable; sections compose them via Slots.
2. **No modes.** Never `if (variant === 'with-breadcrumb')` reshaping the tree. Optional sub-structure is a Slot or a separate composition. (v1's "Extra heading" was a whole section header hidden inside Text & Image — 22 wasted props.)
3. **Use multiple variant axes freely.** A component can have `paddingTop`, `paddingBottom`, `gap`, `columns`, `columnsTablet` as separate `props.Variant`. Webflow's native one-axis-per-component limit is the entire reason v2 needed carriers; it does not apply here.
4. **Variant option strings = token names**, lowercase, exactly (`xsmall`, `two-60-40`, `colour-3`, `full`). Migration then maps v1 → v3 by name with no lookup table.
5. **Defaults must render correctly with nothing set.** A component with no props configured must look right.
6. **A base style must never set a property that a variant also sets.** Equal specificity means source order decides — this caused two silent bugs in v2 ("button colours do nothing", "three columns renders as two"). Scope by variant class; set the property in exactly one place, or guard with `:not()`.
7. **Expose deliberately, not exhaustively.** Design-system decisions (font family, decoration, corner radius) live in the component. Per-instance decisions (content, padding, columns, colour) are props. Every exposed prop is forever and is payload on every API read/write.
8. **Props declared in reading order; `Show`/`Visibility` first in each group.** Order is declaration order.
9. **One layout primitive set** — Container, Grid, Stack, Flex — with identical prop names everywhere. v1's inconsistency (`Column gap` here, `Gap` there) is what made it unlearnable.
10. **Reference Webflow variables, never hardcode values.** `var(--_sizing-spacer-gap---padding--large)`. Each site's variables then theme the same component. (Verify per Test 4 in `references/v3-tests.md`.)

## Prop types available (11)

Text · Rich Text · Text Node (edit on canvas) · Link · Image · Number · Boolean · **Variant** (dropdown) · Visibility · **Slot** · ID. Declared with `name`, `group`, `defaultValue`, and for Variant an `options` array.

## Naming

- Blocks: the thing itself — `Heading`, `Text`, `Button`, `Image`, `Spacer`, `Tag`, `Icon`, `RichText`.
- Layout: `Container`, `Grid`, `Stack`, `Flex`.
- Sections: what it is — `TextAndImage`, `CardGrid`.
- Props on a block: bare (`Text`, `Size`, `Show`) — the block name is the context.
- Props on a section: prefixed by the block they reach (`Heading - Text`, `Button - Link`).
- Groups, in reading order of the section: Section · Layout · Breadcrumb · Heading · Rich text · Text · Button · Image · Spacing.

## Before writing any component

1. Read `references/design-tokens.md` — the corrected token scales. Several v2 carriers offered values with **no variable behind them** and silently rendered nothing. Use these lists, not intuition.
2. Read `references/v1-parity.md` if porting — it says what each v1 prop maps to and what deliberately has no home.
3. Write the full prop list, in order, before the first line of the component.

## Definition of done

1. Spec table: intended values, tokens resolved to px.
2. Built.
3. Read back / diff against the spec.
4. **Visual check** — screenshot or snapshot, compared against the design at the level of structure, order, spacing, colour, font. Never say "done" on an unverified build.
5. Explicit list of anything inferred rather than confirmed.

## Working with the Webflow API / MCP (for placing and configuring instances)

See `references/webflow-api-gotchas.md`. The expensive ones:
- Component ids differ per site; **prop ids and variant ids are preserved** across library installs. Re-query component ids per site; never truncate an id in notes.
- Confirm the target **site** in the first call. Building on the wrong site has happened.
- `set_settings` with `key:"attributes"` **replaces** the whole list; `set_attributes` merges. Never test an unproven write shape on a hand-configured element.
- Batch ≤10 writes per call — the API 429s beyond that; retry the failures.
- After binding a nested prop to a new parent prop, the first instance **reverts to the prop default** — re-set its content.
- Component instances do not accept `set_visibility`; wrap in a div and bind the wrapper.

## Reference files
| File | Read it when |
|---|---|
| `context-and-history.md` | first time here — why v3 exists, what v1/v2 measured |
| `design-tokens.md` | **before writing any component** — the corrected token scales, verbatim as Variant options |
| `component-spec.md` | building or porting a component — every block's props in declaration order |
| `v1-parity.md` | migrating a v1 section — what maps, what's dropped, what needs a decision |
| `v1-text-image-full-manifest.md` | the raw 142-prop v1 surface with ids and defaults |
| `v3-tests.md` | before committing to v3 at all — the 8 gates |
| `webflow-api-gotchas.md` | placing or configuring instances via API/MCP |
| `code-conventions.md` | **writing any v3 code component** — file layout, tokens.json, styling architecture, definition of done |
| `v1-css-migration.md` | building Text/Heading/Button/RichText/Icon/Grid — which v1 framework CSS migrates into the component (decorations, focus ring, grid-boxed, SVG icons) and which dies |
| `icons.md` | any icon prop |
| `build-practices.md` | how to work: verification, safety, ordering, the mistakes ledger |

## Keep the notebook

Anything learned — an API behaviour, a platform limit, a naming trap — goes into this skill or a reference file **in the same turn**, not "later". Corrections are marked as corrections. The companion `build-experience` skill holds general working habits and a mistakes ledger; this skill holds Webflow/v3 facts.
