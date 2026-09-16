# Library | Text Image — v1 Migration Manifest

Component `0ff3a180-a74c-9d97-b864-e9a3aa7c4998` · group `1.1 Core - Sections` · source: fresh default instance read via API (2026-09-06).

**142 props + 2 slots** (`Top` slot `0ff3a180-…-c499c`, `Bottom` slot `0ff3a180-…-c499b`). Variant defaults resolved by name via the utility tables in `shared-library-variant-map.md`.

## Behaviour notes that matter for migration
- The main heading (`Heading - Text/Tag/Text size`) renders ONLY when `Show extra heading (Above content)` is true. `Show Heading` alone does nothing visible.
- Default instance renders rich text + image with `Show text` and `Show button` both false.
- `RIch text` (sic) reads/writes as plain `innerText` via API — formatting must come from published HTML or a Designer pass.
- `Image - Left` / `Image - Right` are two booleans, not one enum; exactly one should be true.
- Slot contents (Top/Bottom) are unreadable-by-value and unwritable via API; migrate slot content manually or design v2 without slots.
- Two props are both named `Icon size` (`627383f1…`, `23daaabf…`) — disambiguate by ID only.

## Section (17)
| Prop | Prop ID | Type | Default | Variant source |
|---|---|---|---|---|
| Container size | `0e349747-ef29-0ae7-e089-7f6cee370ba5` | variant | Medium (`34841f62-9af4-82ef-6aab-9a01dc9d173c`) | `u_section-wrapper_child_container` |
| Container - Left-right padding | `68801652-a163-5995-a45d-65b8f0728661` | variant | Zero (`8c2c72e4-d5ff-b353-98f5-da0f17ed3349`) | `u_padding-sides` |
| Gutters | `7f5ef247-fe41-4dba-f837-a5c01ef1eece` | variant | Standard (`base`) | `u_section-wrapper_child_gutters` |
| Gutter overrides | `39c1ee05-17da-dc98-156a-41e13e3a8a66` | variant | Standard gutters (`base`) | `u_grid_gutter-overrides` |
| Content max width | `59e53fe5-76a8-7a9b-eead-a8c3cae19e1a` | variant | 100% (`base`) | `u_max_width` |
| Container position | `afc7e4fd-3fca-71d3-03ba-94f9cb2948db` | variant | Middle Center (`6cd18339-b544-6928-eff5-f975357c913b`) | `u_align-flex` |
| Content Alignment | `da4a3d66-fc93-0001-0b94-813c71c45cf8` | variant | Middle Left (`base`) | `u_align-flex` |
| Padding top | `6d118e66-0078-dbed-e0c0-27f577fc1380` | variant | Large (`94a64663-25ac-2454-af66-74cd412e8771`) | `u_section-wrapper_child_spacer-top` |
| Padding bottom | `b8f05a60-862a-06da-b335-c497ab9dedbb` | variant | Large (`f4753d71-c48a-982c-c6af-fe5fab1866f8`) | `u_section-wrapper_child_spacer-bottom` |
| Background colour | `7a5383a6-f453-c4ac-2086-aeee5b668e52` | variant | Transparent (`base`) | `u_background-colour` |
| Show button | `79f258d4-3884-b603-92c1-0fd17cff7779` | boolean | false |  |
| Show Button 2 | `9a836baa-3d20-807c-418d-169a3c931f23` | boolean | false |  |
| Horizontal line section top | `104f4239-edb5-019f-f783-6c7d64183605` | boolean | false |  |
| Horizontal line above content | `7ac2da97-c90e-45fc-1bbe-6021fc5f64da` | boolean | false |  |
| Horizontal line below content | `cccf4440-2d31-7c75-45f9-fdd71bebf83c` | boolean | false |  |
| Horizontal line section bottom | `5219ae27-c6d3-923d-0a1b-c8c393b94227` | boolean | false |  |
| #ID for in-page linking | `9515a369-627c-f36c-d1ee-4562a216d6d5` | string | "" |  |

## Grid (7)
| Prop | Prop ID | Type | Default | Variant source |
|---|---|---|---|---|
| Columns | `dbf0a0e7-9bc1-3092-8d2b-e81c9d248256` | variant | Two column 50/50 (`85bd7cf2-c305-c28f-26c0-fa595e7a1364`) | `e_grid` |
| Columns - Tablet down | `3e963cf1-350b-adbb-b6b5-18f2d816b732` | variant | Inherit (`base`) | `u_grid-cols_breakpoint-inner` |
| Columns - Mobile L down | `1e034e5a-ade6-9e81-c04c-079eaf981eaa` | variant | Inherit (`base`) | `u_grid-cols_breakpoint-inner` |
| Columns - Mobile P | `0e535a6a-194f-2d82-4589-3b31b7d7afcd` | variant | Inherit (`base`) | `u_grid-cols_breakpoint-inner` |
| Direction | `cbe067d6-1cfa-dcba-a07a-5abf7e2eabf2` | variant | Standard (`base`) | `u_grid-reverse` |
| Column Gap | `b4589a4b-1c99-6e91-adfd-11edb4cfe0d7` | variant | medium (`a09c7520-98d5-eb60-ad79-d648ad32505c`) | `u_grid-settings_col-gap` |
| Row gap | `6cd7c444-e634-61fa-e7b9-9098d008788d` | variant | medium (`3abc8e97-d8e5-0a1e-923c-37dcd60a015a`) | `u_grid-settings_gap-row` |

## Show/hide & spacers (4)
| Prop | Prop ID | Type | Default | Variant source |
|---|---|---|---|---|
| Show section | `2f1bac54-79f1-5f5a-a303-9e242831e632` | boolean | true |  |
| Show spacer - Text | `1109bee2-e906-c8c2-bc30-09290e02db34` | boolean | false |  |
| Show spacer - button | `c8826418-60e1-14b2-e288-0c1d8ddbf426` | boolean | false |  |
| Spacer - Button | `662cf464-edae-fac7-d6b2-0cc9e8f1f400` | variant | xlarge (`8d10a833-4bbd-21a8-79fc-1c1dc62220e2`) | `e_spacer` |

## Extra heading (above content) (22)
> **v2 decision (2026-09-06): HOLD — not building this block in v2 for now.** Its reason for living inside Text Image rather than being its own component is unclear; to be discussed. v2 ships without it; add later only if relevant. Migration impact: the 3 CAF homepage sections were moved OFF this block already (heading now in rich text), so no live dependency. Any v1 instance with `Show extra heading (Above content)` = true will need its heading re-homed (v2 `Attr | Heading` or rich text) during migration.

| Prop | Prop ID | Type | Default | Variant source |
|---|---|---|---|---|
| Show extra heading (Above content) | `b144ead3-a46b-e963-4063-ae0cd01ae139` | boolean | false |  |
| Show Heading | `b491aec6-a08a-66f7-7e72-312a2d79819b` | boolean | true |  |
| Heading - Text | `59fc6bd2-710c-983a-448c-448e51fb1396` | string | Heading |  |
| Heading - Tag | `cb05e453-d2b4-603b-1a0e-815a5f1f305b` | headingTag | h2 |  |
| Heading - Text size | `6e07902b-0df6-0c22-284b-3ab7f9d96b86` | variant | H2 (`c5baac9c-379b-aa44-2eb3-1989eb65b655`) | `u_heading_inner` |
| Show Button (Above section) | `6241ed60-9ef6-c879-5714-70f2286de02f` | boolean | false |  |
| Button text (Extra heading) | `06fb5a4c-9964-4ce0-be2f-34ae00addb18` | string | See more |  |
| Button Size (Extra heading) | `43e2987a-15a2-a268-a9f3-ad1d6cc7e7ce` | variant | Standard (`base`) | `u_button_child_button-size` |
| Button Icon Show (Extra heading) | `465bf59f-b836-c084-89de-56ad7fd96c9b` | boolean | false |  |
| Bottom spacer (Extra heading) | `dab8ca92-ffbc-d298-ff9d-c5efa665f6e1` | variant | medium (`base`) | `e_spacer` |
| Button - Link (Extra heading) | `aa38ef9a-dbb5-fa4d-a85f-73ed0dd9dd01` | link | url # |  |
| Button - Colour & style (Extra heading) | `732a6776-2f54-248f-c4b1-4c96e6fd87c5` | variant | Standard (`base`) | `u_colour_bg-border-text_hover` |
| Button - Icon (Extra heading) | `6ababf5c-3b16-7ea6-f74f-a03475f9b4d2` | variant | No icon (`base`) | `u_icon` |
| Button - Text size (Extra heading) | `68678093-934a-2fd1-4023-8769daafea6f` | variant | Inherit (`base`) | `u_paragraph` |
| Button - Text Decoration (Extra heading) | `a358b26f-bbba-1caa-cf3d-e48efe3b7fb6` | variant | Inherit (`base`) | `u_font-decoration` |
| Show spacer below heading (Extra heading) | `06ce9ffe-7da5-948f-d12f-de9c7ee2b0b5` | boolean | false |  |
| Spacer below heading (Extra heading) | `17374096-29ab-eed0-b403-c6c7d8674e47` | variant | small (`5c095709-15c3-5bcc-3ccd-2e0230f3c16a`) | `e_spacer` |
| Show horizontal line (Extra heading) | `28b4ff5f-1503-fd64-3d66-bec0e1a70460` | boolean | false |  |
| Horizontal line thickness (Extra heading) | `155b1c97-5d63-f5fc-700a-9488f133d4f3` | variant | Medium (`base`) | `u_border_size` |
| Show spacer below line (Extra heading) | `9c5c9878-0b18-9031-1738-0d25687c9878` | boolean | false |  |
| Spacer below line (Extra heading) | `41fe2653-21b5-5e16-26ec-1847b6a2a459` | variant | small (`5c095709-15c3-5bcc-3ccd-2e0230f3c16a`) | `e_spacer` |
| Button - Text Weight (Extra heading) | `2e1bc68d-8b97-2e0d-69bc-96f4dc65a1f1` | variant | Inherit (`base`) | `u_font-weight` |

## Rich text (6)
| Prop | Prop ID | Type | Default | Variant source |
|---|---|---|---|---|
| RIch text | `fa42fd72-016c-5b7f-2788-0e1efbe4a7ed` | richText | (lorem) |  |
| Rich text - Align | `26ccd524-94f2-e7a6-88b7-8cde2b6fe010` | variant | Inherit (`base`) | `u_font-align` |
| Rich text - Colour | `a363c258-20a0-f7ba-e046-ad221651e8cc` | variant | Inherit (`base`) | `u_text_colour` |
| Show richtext | `028fa5ea-78d3-2eb4-06ce-cb6998d9bb08` | boolean | true |  |
| Show spacer - Rich text | `01e66bc0-e839-3c40-f86d-f56f59294996` | boolean | false |  |
| Spacer - Rich text | `b19063d5-76f9-021f-50af-c283f56a1914` | variant | medium (`base`) | `e_spacer` |

## Text (10)
| Prop | Prop ID | Type | Default | Variant source |
|---|---|---|---|---|
| Text | `d9471d99-db4c-67f3-e338-77966f834f69` | string | Text goes here |  |
| Text - Icon | `b959df04-2c29-e5f2-ea98-da56ec70a769` | variant | No icon (`base`) | `u_icon` |
| Text - Size | `4af6d20c-195a-385b-519f-daa97a78d1b2` | variant | Inherit (`base`) | `u_paragraph` |
| Text - Weight | `6006936f-a878-7b45-0bb4-4704d1f13bbd` | variant | Inherit (`base`) | `u_font-weight` |
| Text colour | `2adc4450-15e1-4b3a-673f-9bdb33341445` | variant | Inherit (`base`) | `u_text_colour` |
| Show text | `b3f3215e-cfb1-fb79-bd42-9d89fdd2c3f7` | boolean | false |  |
| Text - Font family | `e8aedf9d-ec97-bee4-e034-b356fd1c5c8f` | variant | Inherit (`base`) | `u_font-family` |
| Text - Decoration | `30a158e1-0fc4-27ca-ad0b-52cae14c5d57` | variant | Inherit (`base`) | `u_font-decoration` |
| Text - Text alignment | `fa312434-8250-1af1-ac10-d545dc5879f3` | variant | Inherit (`base`) | `u_font-align` |
| Spacer - Text | `76914b66-da7d-7108-b08a-f07a7e2a640f` | variant | xlarge (`8d10a833-4bbd-21a8-79fc-1c1dc62220e2`) | `e_spacer` |

## Button (19)
| Prop | Prop ID | Type | Default | Variant source |
|---|---|---|---|---|
| Button - Text | `5294190d-f89b-eda2-ffe1-164d4dcebdc6` | string | Button Text |  |
| Button - Text separator | `8e4b2e0d-b7ea-ffda-a004-b7c72b15cb24` | string | null |  |
| Button - Text 2nd | `763980d2-fe02-3733-2218-1ec67530f9b6` | string | null |  |
| Button - Text gap | `9099a18c-3b59-a97f-0566-644b1d9e08d2` | variant | Horizontal/No gap (`base`) | `u_horizontal-flex-inline` |
| Button - Link | `0878c573-5860-3c34-c6e2-b6ec00f52dea` | link | url # |  |
| Button - Colour & style | `139e55a6-d405-31a7-375d-35b6ca3197d5` | variant | Standard (`base`) | `u_colour_bg-border-text_hover` |
| Button - Size | `74d7c6a1-4f79-7998-cad9-ea659d6b4569` | variant | Standard (`base`) | `u_button_child_button-size` |
| Button - Text size | `ca61aacc-fdde-eba8-4f9c-78cdc7dcd7c5` | variant | Inherit (`base`) | `u_paragraph` |
| Button - Text weight | `7f07b215-f4f1-53e8-7f3f-01c574906d61` | variant | Inherit (`base`) | `u_font-weight` |
| Button - Font Family | `fa4d6e69-7b6c-4797-53bd-7a4fba17741e` | variant | Inherit (`base`) | `u_font-family` |
| Button - Text - Decoration | `89d52fb0-e627-0991-87f9-900b637527ec` | variant | Inherit (`base`) | `u_font-decoration` |
| Button - Icon after | `05b1c3d3-27e0-e341-e29a-98bd66b60bd2` | variant | No icon (`base`) | `u_icon` |
| Button - Icon before | `35353547-2e1d-3de6-2036-48a408e2f44b` | variant | No icon (`base`) | `u_icon` |
| Button - Corners - Size | `1e4b0785-bf2c-59c6-10ce-96549b772d1a` | variant | Button (`5b940a3d-74f5-383d-fb1f-948d4965100a`) | `u_corners_size` |
| Button - Corners - Sides | `9dea0ea8-1104-f947-2611-b69dd4c4bcdc` | variant | All (`base`) | `u_corners_sides` |
| Button - Target | `6ec12d25-f123-d8b7-1ce6-3135ebf9d933` | string | "" |  |
| Button - Show border all sides | `777cd186-e770-049b-c18f-b8c61bb53175` | boolean | true |  |
| Button - Show border top, left, right | `7dcdc65f-b1e1-e7ec-8892-955510d848bb` | boolean | false |  |
| Multiple Buttons - Layout | `340f5d58-e8ec-91a3-2175-cd0ef673f08f` | variant | base | `u_align-flex` (inferred — verify) |

## Button 2 (18)
| Prop | Prop ID | Type | Default | Variant source |
|---|---|---|---|---|
| Button 2 - Link | `04a1ec58-c4dc-4d95-f028-3c7b89059459` | link | url # |  |
| Button 2 - Text | `fcf0306d-0d47-728c-1763-87afa777c4b5` | string | Button Text |  |
| Button 2 - Text separator | `18dcede8-053c-0721-e6b5-41ed6475c960` | string | null |  |
| Button 2 - Text 2nd | `5e2d00b2-7321-e06e-4171-5f3a4e843ca8` | string | null |  |
| Button 2 - Text gap | `464a9a7d-9c7c-d7f4-ddb6-538aa100685f` | variant | Horizontal/No gap (`base`) | `u_horizontal-flex-inline` |
| Button 2 - Colour & style | `9a703a7f-eacd-27bd-ced2-004be7a6b40f` | variant | Standard (`base`) | `u_colour_bg-border-text_hover` |
| Button 2 - Size | `f3ad7b22-4e04-d8a5-ed33-9085510dc521` | variant | Standard (`base`) | `u_button_child_button-size` |
| Button 2 - Text size | `c8fd7de7-8b52-894d-23db-794a4fb1e8bb` | variant | Inherit (`base`) | `u_paragraph` |
| Button 2 - Text Weight | `2619525e-6a91-f60e-1093-3d58f15f41d8` | variant | Inherit (`base`) | `u_font-weight` |
| Button 2 - Font Family | `fc2dee1f-eddf-e6d1-b46e-dc63447c1366` | variant | Inherit (`base`) | `u_font-family` |
| Button 2 - Text Decoration | `c407fbd6-894b-25bb-3f31-b47aa05684c8` | variant | Inherit (`base`) | `u_font-decoration` |
| Button 2 - Icon before | `746a3b5d-d935-4716-3f20-c69cf9e37a22` | variant | No icon (`base`) | `u_icon` |
| Button 2 - Icon after | `b4347637-671e-ff3a-6227-3d603834539b` | variant | No icon (`base`) | `u_icon` |
| Button 2 - Corners - Size | `d41e2189-138a-d498-2801-6dc7eed0f20e` | variant | None (`base`) | `u_corners_size` |
| Button 2 - Corners - Sides | `5f2bf93c-cba9-ecca-cf0f-bcff9a56173e` | variant | All (`base`) | `u_corners_sides` |
| Button 2 - Show border all sides | `dd80517f-12c3-d964-e462-719cd8e743db` | boolean | true |  |
| Button 2 - Show border top, left, right | `cab90d4a-6893-5d01-9811-9c25bba693ea` | boolean | false |  |
| Button 2 - Target | `9b4b6c13-7381-f1c5-fed8-3b3bb333b1ad` | string | "" |  |

## Image (29)
| Prop | Prop ID | Type | Default | Variant source |
|---|---|---|---|---|
| Image - Left | `f67648fd-1b0a-98cc-406c-a87b331345ba` | boolean | true |  |
| Image - Right | `c0ce1371-c317-e53c-38a6-8370424d6545` | boolean | false |  |
| Image - Breakpoint visibility | `c203c10e-b711-72cb-6bfe-f454e27ae0ab` | variant | Standard (`base`) | `d_breakpoint-visibility` |
| Breakpoint: Same image all | `9f3e6caa-52ed-6e37-8d22-d80776ca32f4` | boolean | true |  |
| Breakpoint: Desktop vs. mobile image | `83c9ac00-d768-6b30-fc5e-580e195d86d6` | boolean | false |  |
| Image | `09b33e10-cd17-2bc2-5fdb-19a845adf990` | image | 684a45bbad0c781b6f9982f8 |  |
| Image (Mobile) | `00c38729-4893-19f7-3a90-f7f5e6a9cf7c` | image | 684a45bbad0c781b6f99828a |  |
| Format: Standard | `ffd6e366-1062-4f2e-5569-2ea4a3625f4c` | boolean | true |  |
| Format: Fill & cover | `c3795428-3a04-1690-8af4-e4b347095b71` | boolean | false |  |
| Alt text | `ae00e216-3925-4d28-e4fd-f44e7a093bb4` | string | inherit |  |
| Image - Max width | `8902d58a-597c-128c-b2f0-61742fa9c560` | variant | 100% (`base`) | `u_max_width` |
| Image - Ratio | `11bd053f-3239-4d0c-2714-cda66ff49f45` | variant | 1:1 (`a2e12c3a-eb89-3add-8426-733cbf023511`) | `u_image_inner` |
| Image - Position | `76850b81-6f45-85e5-4ce0-cbde4c8f2481` | variant | Middle Center (`6cd18339-b544-6928-eff5-f975357c913b`) | `u_align-flex` |
| Image - Corners | `16c8126f-2d31-a717-5fb1-9fbee6a5d384` | variant | None (`base`) | `u_corners_size` |
| Show background image | `50ada3ca-2f86-ee54-cd80-6c525883ccc6` | boolean | false |  |
| Background image | `5cd6ebc9-2b5d-fa0b-1f8b-b081fc79deb9` | string | null |  |
| Image - Corners - Sides | `311f0f01-313b-7d0b-61d2-6db980564175` | variant | All (`base`) | `u_corners_sides` |
| Image Caption - Text | `68d57d4b-0187-d0c6-993f-c2ba3a5f17f0` | string | Long text here |  |
| Show image caption | `f859ab5f-4765-2135-2cfe-44bcef1d5c93` | boolean | false |  |
| Image caption alignment | `28605e91-60e2-2bfb-17dd-d2d898690ab6` | variant | Inherit (`base`) | `u_font-align` |
| Image Caption - Size | `174d834a-9d5b-8fd6-3f64-0faedc84eda0` | variant | Inherit (`base`) | `u_paragraph` |
| Image Caption - Text colour | `ff1e999d-5c92-f9b3-c0d3-02cc4effa5a9` | variant | Inherit (`base`) | `u_text_colour` |
| Lazy load image | `51e9e18e-f13d-1f88-d919-bed7ebf190bb` | boolean | true |  |
| Eager load image | `97b6c20a-f0d0-3995-1fe7-58d0ecdffe54` | boolean | false |  |
| Custom style | `e4c04d66-30c3-9bb6-0932-f22aaca91958` | string | "" |  |
| Show line over image | `575893c0-1da7-c384-8f40-0e61cd86b405` | boolean | false |  |
| Line style | `208da480-539a-c09f-da94-c22ea90302ee` | variant | base | `e_horizontal-line` — styles the line from `Show line over image`; likely also the four section `Horizontal line …` toggles (verify) |
| Show background image - Eager Load | `7b04d035-0a48-5914-2af3-9016906d5f06` | boolean | false |  |
| BG image - Custom style | `7ffd6e58-ad61-4bae-f09c-46db2bb5e147` | string | "" |  |

## Icons (2)
| Prop | Prop ID | Type | Default | Variant source |
|---|---|---|---|---|
| Icon size | `627383f1-9b7a-257e-3a47-8e05996192d7` | variant | No icon (`base`) | `u_icon` |
| Icon size | `23daaabf-49e4-1c4c-2768-734132f170c3` | variant | No icon (`base`) | `u_icon` |

## Slots (4)
| Prop | Prop ID | Type | Default | Variant source |
|---|---|---|---|---|
| Show top slot | `8e56e31b-c5fa-f91d-2d1d-29a388d02f90` | boolean | false |  |
| Show spacer - Top slot | `ea10c44b-9331-daef-1790-32df5373b75e` | boolean | false |  |
| Spacer - Top slot | `3b872f0a-211a-70ff-5e88-5f6254e8ab9b` | variant | medium (`base`) | `e_spacer` |
| Show bottom slot | `a41df9a6-f7d7-0c48-69c3-71387e37e224` | boolean | false |  |

## Archive (4)
| Prop | Prop ID | Type | Default | Variant source |
|---|---|---|---|---|
| zz Text Show | `d3a1693d-c447-00a4-71ce-b6b31507f743` | boolean | true |  |
| zz Button 2 - Icon v1 | `bb795cfa-4e35-c8ff-9f9e-77d6f62a5d70` | variant | No icon (`base`) | `u_icon` |
| zz Button - Icon v1 | `eaf5eec4-00b9-590a-c09a-01ac623e5bad` | variant | No icon (`base`) | `u_icon` |
| Image - Format | `47601ae0-9fe2-bfdd-b49c-a40bcd15ae00` | variant | base | archive — superseded by `Format: Standard` / `Format: Fill & cover`; source unmapped |
