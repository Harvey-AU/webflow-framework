# Mistakes ledger — paid for once, never again
Format: what happened · what it cost · the rule now. Never delete entries.

- **Overwrote a hand-wired conditional while probing an API shape** (Webflow, 2026-09-07). Cost: user's wiring, an undo. Rule: test unproven write shapes on a scratch element; `attributes` via `set_settings`/`static_json` REPLACES the list — read first, prefer merging `set_attributes`.
- **Built a whole composition on the wrong site** (library instead of the client site, 2026-09-09). Cost: ~15 min and tokens. Rule: confirm the target id in the first call when the request names a site.
- **Truncated component ids in notes**, then reused them. Cost: a failed insert batch and a re-query. Rule: full ids only, always.
- **Asserted "all write paths rejected" after testing only the conditional-marker shape.** Cost: a wrong claim repeated for days. Rule: test the specific shape before generalising; say exactly what was tested.
- **Assumed variant props reject tooltips without testing tooltip alone.** Cost: an overclaim; user rightly pushed back. Rule: test each field independently before declaring a type immutable.
- **Said "done" for three props out of forty-eight.** Cost: trust. Rule: "done" is scoped — say "N of M, here's the rest and who owns it".
- **Wrote bare `[data-x]` selectors (0,1,0)** that lost to tag/class rules. Cost: "size doesn't change" bug. Rule: block-scope every rule; checker enforces ≥0,2,0.
- **Child selectors ignored the slot wrapper** — broke grid layout, then `direction: reverse`, separately. Rule: every `>` child rule on a slot component gets both selector forms; recorded in the generator.
- **Carrier offered values with no token behind them** (spacer xxlarge/huge/xhuge; corner "corner-full"). Cost: silent no-render. Rule: read variables before defining values; checker validates against real token lists.
- **Appended variants/props without reordering**. Cost: messy dropdowns, one full prop recreation. Rule: order in the same batch; plan before creating.
- **Kept a redundant control** (section side padding alongside gutters) until the user spotted it. Rule: when two controls overlap, remove one before shipping.
- **Missed the base-variant emission behaviour**: conditional with unmapped base emits no attribute at all; looked like broken CSS. Rule: defaults live in the base rule.
- **Font tokens pointed at a font not installed on the site** — whole page fell to Times. Caught by snapshot, reverted in one call. Rule: confirm a font is loaded (custom fonts list or an existing style using it) before repointing tokens; always snapshot after a token change.
- **Shared the code library twice without being asked** (2026-09-20) — treated "apply the fix" as covering `npm run import`, while the user was mid-review in the Designer. Cost: user's trust, an angry interrupt. Rule: NEVER share/publish (`npm run import`, `npm run ship`, `publish_site`) unless the user explicitly says so in the current exchange; the stopping point after edits is "typecheck clean, ready to share".
