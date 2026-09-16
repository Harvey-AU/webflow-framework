# Playbooks — repeatable procedures
Each playbook: when to use it · steps · verification · gotchas. Write one the second time a task is done. Keep steps concrete enough to follow cold.

---
## PB-01 Start a build session (any surface)
1. Read `build-experience/SKILL.md` habits, then the domain skill for the surface.
2. Confirm the **target** (site/project/env) with an explicit id in the first call.
3. If the surface has a live-session bridge (e.g. Webflow Designer MCP), check it; if down, send the launch link before starting so snapshots work when needed.
4. Open the reference file for that target; re-query anything marked "re-query per site".
**Verify:** first read succeeds against the intended target.

## PB-02 Build a section on a client site from library blocks (Webflow v2, "B-on-site")
When: a section is needed on a specific site and slot-based composition is unavailable (client sites).
1. `data_element_builder` — one nested call: `section > container > grid > stack` as attributed divs with static values (padding, gap, columns, direction, valign, container width, gutters).
2. Insert library block instances into the stack/grid (`insert_component_instance`, parent = the plain div). Non-Attr blocks get a `<div data-el-wrap="x">` around them first.
3. Order: append in reading order; to insert between, use `after` on a **plain-div** anchor (instances can't be anchors).
4. Configure every instance by prop **id + type** (never by name — names can be scrambled after install). Variant values are variant ids (stable across sites).
5. Snapshot; compare to spec; fix; snapshot again.
6. If reusable on this site: `transform_element_to_component` → create content props in reading order (Show first per group, with group + tooltip) → bind through with `type:"bindable"` → set instance-only values (image) → snapshot again.
**Verify:** snapshot matches spec; read-back shows every prop bound.
**Gotchas:** component ids differ per site; prop/variant ids don't. Assets endpoint rate-limits (429) — retry once.

## PB-03 Add a token family (carrier + CSS) — Webflow v2
1. Confirm the tokens exist and read their real values (`query_variables`); never assume from names.
2. Create the carrier: host div → `transform_element_to_component` → variants in canonical order (base named for its scale position) → `reorder_variants` if anything was appended → hide root.
3. Add the family to `gen_attr_css.py` with block-scoped selectors (≥0,2,0), base-rule defaults, and both forms of any child selector (direct child AND slot-wrapper child).
4. `python3 gen_attr_css.py && python3 check_attr_css.py` — must show no MISSING, no orphans, no weak selectors.
5. Paste the delta (or the regenerated sheet) into the embed; snapshot a probe.
6. Update `v2-ids.md` (carrier id, values) and the wiring checklist.
**Gotchas:** every added value needs a rule or the checker fails; a value with no token behind it renders nothing.

## PB-04 Verify a render (definition of done)
1. Spec table: intended value per setting, tokens resolved to px.
2. Read-back diff.
3. Snapshot in the right canvas context (`get_current_component` first — page vs component editor).
4. Compare against the design at the level of structure, order, spacing, colour, font, alignment. Note viewport differences (a narrower canvas wraps text differently) so they aren't mistaken for bugs.
5. List deviations and inferences explicitly.

## PB-05 Reorder or rename props (when no reorder API exists)
Only if truly necessary — expensive.
1. Record every prop id, binding target, group, tooltip, default.
2. `remove_prop` all → `create_prop` in the intended order (one batch).
3. Rebind every passthrough; re-point any visibility/attribute bound to a removed prop.
4. Reset instance-only values (image props have no default).
5. Snapshot to confirm nothing changed visually.
**Prevention:** plan the full ordered list before the first `create_prop`.

## PB-06 Fix a "CSS isn't working" report
1. Build a plain probe with **static** attributes; snapshot. Works → CSS is fine, problem is attribute emission (unmapped conditional base, wrong context). Fails → CSS or selector.
2. If emission: base rule must carry defaults; a conditional with an unmapped base emits nothing.
3. If selector: check specificity (must beat single-class rules), and slot wrappers (`display:contents` children need the second selector form).
4. Check source order across multiple embeds — a stale earlier rule at equal specificity loses to a later one; a stale LATER rule wins. Regenerate the stale embed.

## PB-07 Migrate a v1 instance to v2 (planned)
1. Read v1 instance props (full snapshot to a manifest file).
2. Map variant uuid → name → v2 value by name (variant names = token names).
3. Insert v2 section/preset in the same position; set every prop in one batched call by id.
4. Anything in the "no landing spot" list gets flagged, not dropped silently.
5. Remove v1; read-back diff; snapshot; publish; parse published HTML for content equality.
