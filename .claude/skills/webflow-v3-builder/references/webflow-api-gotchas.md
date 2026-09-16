# Webflow API / MCP — verified behaviours
Everything here was established by testing during the v2 build (MCP 2.0.1, Sept 2026). Re-test only if a changelog after that says otherwise.

## Identity
- **Component ids differ per site.** Prop ids and variant ids are **preserved** across a library install. Re-query component ids per site; reuse prop/variant ids.
- **Never truncate an id.** A shortened id in notes is a guaranteed later failure. (Cost a failed batch; the error message conveniently lists all valid ids.)
- `query_components` keywords containing `|` or `&` silently miss. Search plain words.
- **Confirm the target site in the first call.** A whole composition was once built on the wrong site.

## Writes
- `set_settings` with `key:"attributes"` **replaces the entire attribute list** — any conditional or binding not included is destroyed and cannot be recreated via API. `data_element_tool > set_attributes` **merges**; prefer it.
- Test unproven write shapes on a **scratch element**, never on something hand-configured. Delete it after.
- Batch ≤10 writes per call; beyond that the API 429s. Retry the failures.
- `insert_component_instance` cannot use a **component instance** as an anchor (`after`/`before`) — anchor on a plain element, or append to the parent.
- Component instance elements do **not** accept `set_visibility` ("Element does not support setVisibility"). Wrap in a plain div and bind the wrapper's visibility.
- After binding a nested instance's prop to a new parent prop, the **first instance reverts to the parent prop's default** — re-set its content.
- Image props cannot carry a default; set the asset per instance.
- Rich text prop **defaults** cannot be set via API (`default_text` rejected for `richText`); instance values can be set, plain text only.
- `update_prop` shape is `props:[{prop_id, name?, group?, tooltip?, default_*}]`. It works on string/boolean/image/link/richText. **Variant props and headingTag are not updatable** — no rename, no group, no tooltip. Plan names before creating.
- **There is no reorder action for props.** Order = creation order, permanently. Plan the full ordered list before the first `create_prop`; fixing it later means remove-all → recreate → rebind every passthrough → reset instance-only values.
- `set_component_metadata {component_id, name?, group?, description?}` sets component descriptions. Use them — they are how a future session knows what a component is.

## Conditionals (v2's core mechanism — Designer only)
Reading or writing the variant→value mapping is **impossible via API**. Verified four ways: the binding schema's `source_type` enum is `prop|cms|page|locale|localeItem` (no `conditional`, no `variant`); all write paths reject; MCP 2.0's capability list doesn't mention them; the Designer bridge adds nothing. `get_attributes` returns the opaque marker `{"sourceType":"conditional"}` and `with_resolved_bindings` returns `null` at design time.
**But:** attribute values **can** be bound to `prop` (string or boolean) via the raw JSON path — `static_json` `[{"name":"data-x","value":{"sourceType":"prop","propId":"…"}}]`. A boolean-bound attribute does not emit the literal `"true"`; match with `[data-x]:not([data-x="false"])`.

## Slots
- Create with `type:"ComponentSlot"` (not `"Slot"`), inside a component definition only.
- Filling works for **native** components on the same site (`insert_in_slot`, parent = the instance, `slot_name`).
- **Library-installed components cannot be inserted into a slot on a client site** — "Component not found", by name, by id, with the Designer bridge live, prefixed, all fail.
- `move_element` cannot move an existing element **into** a slot.
- Slot children have **no element ids** — they cannot be configured via API. A slot-composed preset is therefore unconfigurable until a human exposes props.
- Nested slot content inside a wrapped component definition is unreachable (`insert_in_slot` with `scope_component_id` resolves only direct children of the root).
- **Consequence:** design a slot-composed preset completely before wrapping it.

## Nested instances (this is the good path)
Instances nested inside a **native** component definition **do** have element ids. So Claude can create the section's props and bind them through with `type:"bindable"` — no Designer step for content props. This is what made the "compose as divs + instances → transform to component → bind props" pattern work.

## Designer bridge (for screenshots)
`element_snapshot_tool` needs the Webflow MCP Bridge App running in a foreground Designer tab, **per site**. It drops when the tab idles; `designer_tool` returns a relaunch link. Snapshots only reach elements in the **current canvas context** — call `get_current_component` first; "element does not exist" usually means wrong context, not a missing element. Judge structure from snapshots, not absolute spacing (canvas width can trip a breakpoint; fonts can fall back mid-render).

## CSS distribution (the v2 tax that v3 removes)
Splitting a stylesheet across multiple embeds caused three bugs where two same-specificity rules fought and load order decided. If any CSS must still be distributed, **one file, one link, generated, never hand-edited.**
