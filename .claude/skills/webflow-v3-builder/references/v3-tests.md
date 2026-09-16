# Tests to run before committing to v3
Ordered. 1–3 are gates.

## 1. SSR on a published page ⛔
Publish a page with a code component → View Source → is the markup in the HTML, or an empty mount div filled by script?
**Fail ⇒ stop.** v2's whole value is DOM/markup without JS; client rendering trades that for a bundle plus hydration.

## 2. API prop access on a code-component instance ⛔
Install one on a scratch page → `query_components` (does it appear? flags?) → `get_component_instance_props` → `set_component_instance_props`.
**Expected pass:** Webflow's MCP changelog states library and code components appear in lookup results with read-only/runtime flags, in the same release that adds setting instance prop values. The Designer response carries `isCodeComponent`.
**Fail ⇒** migration becomes a Designer session per page; reconsider scope.

## 3. CMS binding on a code-component prop ⚠️
Put one inside a Collection List; bind a Text prop to a CMS field — in the Designer, and via API.
DevLink *Export* explicitly does not support CMS-bound components, and the changelog hedges ("in many cases"). Most of CAF is CMS-driven.
**Fail ⇒** hybrid: code components for static sections, native for CMS-driven. Decide before designing the set.

## 4. Webflow variables inside a code component
Same component on two sites with different brand colours — does each render its own? **Fail ⇒** pass tokens as props.

## 5. Interactions / IX2
Can IX2 target anything in a code component, or does all animation move into React? (v2 couldn't be targeted at all — attributes aren't selectable.)

## 6. Client editing
Give a non-technical person a page of them: change text, swap an image, toggle a section. Can they, unaided?

## 7. Update propagation
Publish a change → accept on two sites → both update, neither breaks. Also: what happens to an instance when a prop is **removed** from the definition?

## 8. Performance, measured
Lighthouse mobile, 3 runs: v1 vs v2 vs v3. Never claim a number that hasn't been measured. (v1-vs-v2 pages already exist on the playground.)
