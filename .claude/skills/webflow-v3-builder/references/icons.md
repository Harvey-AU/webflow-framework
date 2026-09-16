# Icon glyphs (from v1 `u_icon`, ~60) — the vocabulary for any icon prop
CAF buttons use **arrow-stem-up-right**. Default on Text is arrow-stem-right.

arrows (stem): right · left · up · down · up-right · down-left · down-right · up-left · and `-pipe` variants of right/left/up/down
chevrons: arrow-right · arrow-left · arrow-up · arrow-down
triangles: up · down · left · right
ui: close · check-mark · plus · menu · search · search-2 · send · more · phone · settings
separators: forward-slash · pipe · dash · dash-long · dot
status: cross-circle · check-circle · info-circle · user-circle · crown · lock
content: quote · law-hammer · book-open · video-play · document-simple · document-edit · location-pin · graduate-cap
custom-1…5 (per-site slots)

In v1 these are mask-images in `main.css` (97 KB raw, ~37% of that sheet, architecture-neutral). In v3 either port the mask set into the icon component or use inline SVG — inline SVG is simpler and drops the external CSS dependency. Keep the **names** either way; they are the stable API.
