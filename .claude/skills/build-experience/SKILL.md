---
name: build-experience
description: >-
  Claude's own accumulated working knowledge - playbooks for repeatable tasks, a ledger of mistakes and their fixes, and the standing habits that make each session start where the last one ended. Use this at the START of any build, automation, or tooling session (Webflow, Shopify, API/MCP work, CSS systems, anything with tools and IDs), and UPDATE it in the same turn whenever something is learned - a tool behaves unexpectedly, a task is done for the second time, a mistake costs time, or the user corrects a habit. Trigger it even when the user does not mention it; the point is that it compounds. Pairs with domain skills (e.g. webflow-v3-builder), which hold the facts; this skill holds how Claude works.
---

# Build experience

This is the junior developer's notebook that becomes senior judgement. Domain skills record *what is true* about a system. This skill records *how Claude works*: the procedures that are now routine, the mistakes that have already been paid for, and the habits the user has had to ask for more than once.

Three files, three purposes:

| File | What goes in it | When to read | When to write |
|---|---|---|---|
| `SKILL.md` (this) | habits and principles that apply everywhere | every session start | when a habit is corrected or a principle is learned |
| `references/playbooks.md` | step-by-step procedures for tasks done more than once | before doing a task the second time | the second time a task is done — turn it into a playbook right then |
| `references/mistakes.md` | what went wrong, what it cost, the rule that prevents it | when about to do something risky | the same turn a mistake happens, before continuing |

**The one rule above all others: write in the turn it happens.** "At the end" never arrives. A finding that isn't written down in the same turn is a finding the next session pays for again.

## Habits (learned from the user, in their words where possible)

### Verification
- **Take a snapshot and verify before saying anything is done.** "Done" means seen, not sent. If the surface offers a visual (Designer snapshot, rendered page, screenshot), get it and *look at it against the spec* — structure, order, spacing, colour, font. Say what matches and what doesn't.
- **Read back what was written.** After any write, confirm the value is present. A successful tool call is not confirmation; the read-back is.
- **Definition of done** for any build: (1) spec written with intended values, tokens resolved to real numbers; (2) writes applied; (3) read-back diff against spec; (4) visual check; (5) an explicit list of what was inferred rather than confirmed.
- Diagnose with a **probe element**, not by staring at config: build the simplest thing that should work, using static values. If the probe works, the system is fine and the problem is in the specific object; if it fails, the system is broken.

### Order and hygiene
- **Always order what you add.** Variants, props, values, Navigator names — creation order is display order and there is often no reorder. Plan the whole list before the first create call. Scales go small→large; `Show` toggles come first in their group; groups follow the reading order of the thing they describe.
- **Never leave a mess for later.** If an addition breaks a sequence, fix it in the same batch.
- **Names are the API.** Uniform vocabulary across components (`Text`, `Link`, `Image`, `Show`, `Size`). No prefixes where context already exists; prefixes only where they disambiguate. Decide names before creating, because renaming is often impossible or manual.
- **Descriptions everywhere** — components, props (tooltips), groups. Future sessions read them instead of inspecting.

### Working with a system of IDs
- **Never truncate IDs in notes.** A shortened ID is a guaranteed failure later. Full IDs, always, in the reference file.
- **Confirm the target site/project/environment in the first call.** Building in the wrong place wastes the whole build.
- **IDs are not portable unless proven.** Test what survives a copy/install (in Webflow: prop and variant IDs survive library install; component IDs do not).
- **Query names loosely.** Special characters in search keywords (`|`, `&`) silently miss. Search plain words.

### Safety
- **Test destructive or unproven write shapes on a scratch element**, never on something the user has hand-configured. Delete the scratch afterwards.
- **Know which writes replace vs merge.** A "replace the full list" write on a wired object destroys hand work. Prefer merging writes; read before replacing.
- If something is destroyed: say so immediately, name what was touched, stop. Undo exists only in the session it happened.
- Batch related writes, but keep risky writes in their own call so a failure doesn't sink the safe ones.

### Unattended sessions
- **When the user is away (asleep, AFK), avoid tools that trigger permission prompts** — Bash/shell especially. Work with prompt-free tools (Write/Edit/Read/Grep) and queue every gated step (typecheck, builds, servers, imports) on an explicit "when you're back" list. A prompt nobody answers is a stalled night. (User correction, 2026-09-13.)

### Token economy
- Big payloads (150-prop echoes) exhaust context and trigger rate limits. Ask for cropped surfaces; store what's needed in reference files instead of re-reading.
- Generated artefacts (CSS, manifests) come from a **script that is the source of truth**, never hand-edited. Regenerate; don't patch.
- Don't narrate tool machinery; say what was found and what changes.

### Honesty
- When wrong, say what was wrong, how wrong (scope), and what the corrected claim is. Mark corrections in the notes as corrections, not silent edits.
- Distinguish **measured** from **modelled** from **guessed**, and label numbers accordingly.
- Say the boundary clearly when something is outside Claude's reach ("Designer-only", "not in the API") — and stop re-testing settled boundaries unless the platform changes.

## When to open the other two files
- About to do a task that feels familiar → `references/playbooks.md`. If it isn't there yet and this is the second time, write it after.
- About to do something with `remove`, `delete`, `replace`, `unregister`, or a write on a hand-configured object → `references/mistakes.md`.
- User says "always", "never", "from now on", "don't do that again" → this file, Habits, same turn.

## Growing this skill
Add a habit when the user has to say something twice. Add a playbook when a task is done twice. Add a mistake when time was lost. Prune when a habit becomes automatic across many sessions — but keep the mistakes ledger permanently; it's the cheapest insurance there is.
