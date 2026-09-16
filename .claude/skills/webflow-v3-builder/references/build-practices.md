# How to work on this — practices that came from doing it wrong first

## Use the real thing
**If a component exists for it, use the component.** Never reproduce one by hand-writing its markup/attributes onto plain elements — the copy has no props, no defaults, no updates, and diverges silently. (Cost: a hand-built "tag" that had to be rebuilt.) If the component exists but isn't available where you're building, **say so and ask** — don't substitute a lookalike.

## Repetition becomes a component
When a structure repeats and only the content differs, build it once and use N instances. Three hand-built cards is three times the maintenance and three chances to diverge.

## Plan before creating
- **Prop order is permanent.** Write the full ordered list before the first prop exists. `Show` first per group; groups in reading order.
- **Names are the API.** Uniform vocabulary across components; no prefixes where context already exists.
- **Order what you add.** Scales run small→large; semantic values after the scale; never append to the bottom of an existing list.

## Verify, don't assert
- "Done" means **seen**. Screenshot/snapshot against the design before saying so.
- Read back what you wrote; a successful call is not confirmation.
- Say "N of M done, here's the rest and who owns it" — never "done" for a fraction.
- Diagnose with a **probe**: build the simplest static version of the thing. If the probe works, the system is fine and the bug is in the specific object.
- Distinguish measured / modelled / guessed, and label numbers accordingly.

## Safety
- Unproven write shapes go on a scratch element, never on hand-configured work.
- Know which writes replace vs merge.
- If something is destroyed: say so immediately, name what was touched, stop. Undo only exists in that session.

## Token economy
- Don't re-read 150-prop payloads; store ids in a reference file.
- Generated artefacts come from a script that is the source of truth — regenerate, never hand-patch.

## Design-system invariants worth keeping as tests
These were CSS linters in v2; in v3 they're unit tests:
1. Every variant option has styling behind it.
2. No orphan styles for options that no longer exist.
3. No base style competing with a variant for the same property.
4. No value referencing a token that doesn't exist.
5. Defaults render correctly with nothing set.

## Mistakes ledger (don't repeat)
- Overwrote hand-wired conditionals while probing an API shape.
- Built a whole composition on the **wrong site**.
- Truncated component ids in notes, then reused them.
- Claimed "all write paths rejected" after testing only one shape.
- Said "done" for 3 of 48 props.
- Wrote bare `[data-x]` selectors that lost to class rules.
- Forgot slot wrappers are real DOM elements — broke grid layout, then `direction:reverse`, twice.
- Offered carrier values with no token behind them.
- Appended variants/props without reordering.
- Built a new component when an existing wired one needed two extra settings.
- Hand-rolled a div instead of using the component that already existed.
