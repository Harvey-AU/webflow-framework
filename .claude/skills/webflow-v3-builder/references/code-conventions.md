# v3 code conventions — file layout, naming, styling architecture
Settled 2026-09-11 after Container shipped and verified working in the Designer. These are the code-component-specific rules; the design vocabulary and prop rules in SKILL.md still govern.

## Where code lives
Inside `code-components/` (the Kaytetye npm project) **for now** — deliberate: components are plain files, moving them to a dedicated v3 project later is a copy-paste plus one import. Until then:

```
src/tokens/tokens.json        ← THE vocabulary. Ordered option → {path}|{literal} per scale
src/tokens/index.ts           ← only code that turns a token into CSS (tokenValue/tokenOptions)
src/components/<Name>.tsx     ← pure React block. No Webflow imports, props-only
src/webflow-components/<Name>.webflow.tsx  ← declaration (props, group, description)
preview/<name>.html + .tsx    ← local harness, npm run dev:preview, port 4000
```

- v3 components use Designer group **"Harvey v3"** so they never mix with Kaytetye entries in the Add panel.
- File name = component name exactly (`Container.tsx`, not `container.tsx`).
- The Kaytetye files (Tailwind/shadcn) are frozen spike code — never a style reference.

## Naming
- **Components**: per SKILL.md — blocks are the thing itself (`Heading`, `Spacer`), layout is `Container`/`Grid`/`Stack`/`Flex`, sections are `TextAndImage`-style compositions.
- **Code prop keys**: camelCase, short, British spelling to match the token vocabulary (`paddingTop`, `textColour`, `background` — not `backgroundColour`; drop the noun when the type says it).
- **Designer names**: sentence case, bare on blocks (`Padding top`, `Show`), block-prefixed on sections (`Heading - Text`). `Show` first in every group.
- **Group order (user rule 2026-09-14): Show → Style/Layout groups → Content → extras (Icon etc.).** Styling is configured first when placing; content gets edited on canvas afterwards. Inside a group, prop names go bare where the group heading carries context (Icon group: `Glyph`, `Before text`).
- **Options**: token names verbatim, lowercase kebab, declared ONLY in `tokens.json`. JSON key order = dropdown order = small→large, semantic values after the scale.

## Styling architecture
1. **Every value resolves through `tokenValue()`** — the dual-fallback chain `var(--_<path>, var(--<ns>_<path>))`, literals only where v2 ships literals. No component builds its own map; no hardcoded values, ever.
2. **Inline styles** for everything static and single-value (Container's padding/colours). No specificity fights are possible, nothing to distribute.
3. **When a component needs pseudo-states or media queries** (Grid responsive columns, Button hover): **inline custom properties + a tiny STATIC stylesheet** (decided 2026-09-11, superseding an earlier class-generation idea). The component sets values as inline CSS custom properties (`--cols: 6fr 4fr` from tokens.json); a fixed ~10-line `<style>` rendered by the component carries the structure — media queries and pseudo-states referencing those properties with `var()` fallback chains (`var(--cols-t, var(--cols))`). `inherit` = don't set the property; the fallback chain cascades. No generated classes, no per-option rules, nothing to drift. The `<style>` sits in the component because each shadow root needs its own copy (page CSS can't reach in). **Breakpoints in component CSS ≈ Grid only** — responsive type/spacing is the SITE's job via Webflow variable modes (variables can hold per-breakpoint values; components inherit that for free). **No Tailwind** — with this mechanism there is no utility layer left for it to provide.
4. **Structure** (corrected 2026-09-20 to match v1): full-bleed outer box carries background and ALL padding — vertical padding AND gutters; the inner content box is purely the width constraint (`max-width` from the container scale + auto margins). Gutters inside the constrained box shave 2×gutter off the content width and don't match the old library. Slot children land in the inner box.
5. **Defaults mirror the v2 base variant** so a props-less instance renders like its v2 counterpart and migration maps 1:1.

## Declarations
- `props.Visibility` "Show" first, handled in a `Declared<Name>` wrapper that returns `null`. **TEMP (2026-09-17): all wrappers currently return `<HiddenPlaceholder />` instead** — a Webflow Designer bug breaks code components that return `null` when Visibility is off; Webflow support supplied the hidden-div workaround and is fixing the underlying bug. When the user says the fix shipped: delete `src/webflow-components/HiddenPlaceholder.tsx` and revert every `return <HiddenPlaceholder />;` (plus its import) back to `return null;` — grep for `HiddenPlaceholder`.
- Every `declareComponent` gets a real `description` — it's how designers and future sessions know what it is.
- `options: { ssr: "prerender" }` only when the component reads data; omit for pure presentation.
- Slot props cannot carry defaults (`Slot` is in `PropTypesWithoutDefaultValue`). Pre-built content = a composition component with Show props; slot fallback JSX only for "if you provided nothing" cases, and verify empty-slot detection on canvas first.

## The Designer's :empty scaffold (found by user, 2026-09-15)
The canvas injects a constructed stylesheet: `[data-root] > :empty { min-width/min-height: 75px; inset box-shadows; dashed outline !important }` — its "empty component" indicator. **An `<img>` (or any void/childless element) as the component's direct root child ALWAYS matches** — img is `:empty` by definition, src set or not — and renders broken on canvas. Rule: a component's root child must be a child-bearing element; wrap bare imgs/voids in `<div style="display:contents">`. The outline is !important — avoid matching, don't fight it.

## Rich Text PROPS are slotted light DOM (verified on published ACSI HTML, 2026-09-23; shipped and confirmed working)
A `props.RichText` value is NOT rendered inside the shadow root. Webflow puts a `<slot name="<propKey>">` where the JSX placed `{content}` and delivers the actual rich text as light DOM: `<div class="w-richtext" slot="content">…</div>`. Three consequences, all verified:
- **Shadow CSS cannot style it** — `::slotted()` reaches only the wrapper, never descendants. Shadow rules DO work in the local preview (content passes as plain React children), so a preview proves nothing about slotted content.
- **library.globals cannot style it either** — Webflow injects the globals stylesheet link per-island into the shadow templates, not the page head. Globals is shadow-scoped CSS, not a page stylesheet route.
- **The working mechanism** (RichText.tsx): one flat `RT_CSS` template string scoped `.w-richtext[slot]`, injected once into `document.head` by a useEffect (id-guarded singleton). The scope matches only rich text slotted into code components (RichText Content, Accordion Body, …), never a site's own rich text. The component renders its own `<div className="w-richtext" slot="content">` wrapper around `{content}` so the same rules cover the preview. Custom props on `.rt` (--rt-fs/--rt-lh Size override, --rt-hr-*) inherit across the slot boundary — that's how mode-aware values reach the light DOM; per-tag article variables are an open gap (static page CSS can't see the Style prop).
Keep components SIMPLE — flat template-string CSS like Button, no rule-generator machinery (user ruling 2026-09-23). And never put v3 styles in the v1 framework CDN repo.

## Slot DOM at runtime (verified from published HTML, 2026-09-13)
Webflow renders a component's slot as `<slot name="children">` in the shadow root, and puts ALL slot content into **one light-DOM `<div slot="children">` wrapper**, with each dropped element in its own inner `<div>`. Nested code components render as `<code-island>` with inline `display:contents` (already transparent).
**Consequence: every layout component where direct children matter (Grid, Stack, Flex) needs `::slotted([slot]) { display: contents; }` in its static CSS** — otherwise the wrapper is the only child and layout collapses. Keep it a separate rule (harmlessly matches nothing in the shadow-less local preview). Limits: `::slotted()` reaches ONLY the top-level wrapper — the per-item divs can't be styled from shadow CSS (no `min-width: 0` on real cells; live with it). Inheritance still flows through `display:contents`, so `direction: ltr` on the slotted wrapper resets text inside the rtl mirror trick.

**Native components/Slots inside layout code components (verified on CAF DOM, 2026-09-14):** wrapping a section into a NATIVE component and putting a native Slot inside a Grid adds a SECOND light-DOM wrapper (`div[data-w-instance-of]`) between the slotted wrapper and the cells. `::slotted` cannot reach it — the grid collapses to one cell again. Rules:
- A native Slot AS one cell is fine (one box = one cell) — the CardGrid pattern is Grid → N Slots → card each.
- A native Slot holding MULTIPLE cells breaks layout. If genuinely needed (it is: the native-wrapper + inner-Slot pattern is how the MCP inserts content, since library code components can't be slotted via API), the Slot needs `display: contents` via the **`u-contents`** class — created through the style API (`create_style` accepts `display: contents` even though the Designer's display picker doesn't offer it; verified on CAF 2026-09-14, style id 167965ee-e3d4-855b-e1a3-fc1d9c1a72fe). **Applying the class to the Slot is Designer-manual**: a native Slot nested inside a code component's slot has NO API-addressable element id (set_style → "Element not found"; the v2 gotcha holds in v3). Keep u-contents in the site template so duplication carries it.
- The site pattern: each code component gets a native "Code components | X" wrapper with pass-through props + an inner Slot — that's what makes MCP composition possible (insert_component_instance + insert_in_slot work on native components).
- Fixed-structure organisms (heroes etc.) need no inner Slot at all — cells live directly in the component definition.

## Extending tokens.json
Only with verified entries: query the variable on the library site first (`query_variables`), then add `{path}` — or `{literal}` if v2 ships a literal. Never add an option because the scale "should" have it. Typography is deliberately absent (size pairs with line-height — needs its own shape when Heading/Text is built).

## Definition of done per component
1. Prop list written in order before code.
2. Preview harness exercises every axis + the second theme scope (variables-only re-skin).
3. `npm run typecheck` + esbuild bundle clean.
4. Looked at in the browser (dev:preview) against the design.
5. `npm run import`, then verified on canvas in the Designer.
6. Anything learned → this skill, same turn.
