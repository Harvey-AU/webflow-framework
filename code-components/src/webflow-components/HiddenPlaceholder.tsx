/**
 * TEMPORARY workaround — Webflow Designer bug (Webflow support, 2026-09-17):
 * a code component that returns `null` when its Visibility prop is off breaks
 * in the Designer. Webflow's suggested workaround is to render an inert hidden
 * element instead — no layout space, nothing painted, out of the accessibility
 * tree; the only cost is one empty div in the markup.
 *
 * TO REMOVE once Webflow ships the fix: delete this file and revert every
 * `return <HiddenPlaceholder />;` in the *.webflow.tsx wrappers back to
 * `return null;` (grep for HiddenPlaceholder).
 */
export function HiddenPlaceholder() {
  return <div aria-hidden="true" style={{ display: "none" }} />;
}
