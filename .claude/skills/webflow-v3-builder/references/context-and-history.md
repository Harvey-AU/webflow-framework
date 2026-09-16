# Why v3 exists — the short history

## v1 (the monolith, ~20 sites, frozen)
One `Library | Text Image` section = **142 props + 2 slots**. Every style option was a nested `u_*` utility component, i.e. a real wrapper div. Measured on a 10-card grid: **991 DOM nodes, 99 per card, max depth 70, 269 KB raw HTML**. The site stylesheet was 595 KB raw / 64 KB gzip, 2,074 rules, and **11 of 12 named utilities had zero CSS rules** — pure DOM cost. Typos shipped forever (`RIch text`), props accumulated, nobody could learn it.

## v2 (attribute pattern — built Sept 2026, works, now frozen)
**v2 never reached production** (correction 2026-09-11): the v3 decision was made after building some v2 components, before any deployment. v2's vocabulary, architecture lessons and measurements stand; its SCOPING choices (which features/options it dropped from v1) carry zero usage evidence. v1 is the only production evidence there is.
Real element + hidden **carrier** components whose variant drives a `data-*` attribute, styled by one generated stylesheet (`attr-v2.css`, 368 rules, ~4 KB gzipped).
Measured against v1, same content: **114 nodes vs 991 (-89% per card), depth 3 vs 70, 3.0 KB vs 6.1 KB gzipped HTML.** At parity of props the gap barely moves — props cost DOM in v1 and bytes in v2.
It works. What it costs:
- Every attribute needs a **Designer-wired "conditional"** mapping variant → value. No API can read or write them (verified exhaustively: schema enum, three write paths, MCP 2.0 capability list, Designer bridge). 44-value button colour = 44 hand-typed rows.
- **One variant axis per component** is the reason carriers exist at all.
- Variant props cannot be renamed, regrouped or given tooltips via API — Designer only.
- The stylesheet must be distributed to every site. Splitting it across embeds caused three same-specificity bugs.
- Slots: library components cannot be inserted into a slot on a client site; `move_element` cannot move anything into a slot; nested slot content in a wrapped preset is unreachable.

## v3 (code components — the plan)
Every one of those costs disappears: `props.Variant` is the dropdown, many axes per component, styles ship in the bundle, slots are `children`, props are typed in a file you can review. **The design vocabulary from v2 transfers unchanged** — that work was not wasted; only the workaround machinery is.

## What was measured, so it can be repeated
- v1 vs v2 card grid: nodes, depth, raw and gzip HTML, CSS size. Pages exist on the playground (`Compare OLD - Cards`, `Compare NEW - Cards`).
- Never measured: **Lighthouse**. Do it (v1 vs v2 vs v3, mobile, 3 runs) before making performance claims to anyone.

## Sites
Component library `harvey-components-jan-25` · CAF (`cleaningaccountability`) is the pilot client site.
