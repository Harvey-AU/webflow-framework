# Kaytetye code components

Sandbox for experimenting with [Webflow Code Components](https://developers.webflow.com/code-components/introduction).
Separate npm project - nothing to do with the CDN build in the repo root.

## Local preview

```bash
npm install
npm run dev     # http://localhost:4000
```

Renders the home page at `/`, and the theme-collection page at `/words.html`, with React, no Webflow account needed.
`npm run dev` runs the Tailwind watcher and esbuild together.

## Import into a Webflow workspace

```bash
npm run import  # webflow devlink import
```

Needs a real terminal - the CLI turns on `--no-input` inside agent shells and skips the prompts that mint the library id.
First run opens a browser to authorise a workspace, then writes the library `id` into `webflow.json`.
Watch the "Ready to share ... with \<workspace\>?" line: that is the only place the target workspace is named.

Requires Node 22.13+, and a workspace on Freelancer plan or higher (or the site on Business plan or higher).
On a free workspace the library uploads fine but the Designer refuses to install it.

## Components

Seven are registered with Webflow, all in `src/kaytetye/`, grouped as **Kaytetye** in the Designer's Add panel.

| Component | What it does |
| --- | --- |
| Site Header | Wordmark and nav. The Nav slot takes Webflow link blocks; empty falls back to the design's three links. |
| Hero Banner | Breadcrumb, title, gloss, intro copy, optional button and an illustration, on Country red. Empty breadcrumb gives the home page's Angke banner. |
| Feature Grid | Home page theme strip: heading, gloss, View all link and a Cards slot for Feature Cards or a Collection List of them. |
| Feature Card | Square image, Kaytetye word and gloss, whole card is a link. Built to be CMS-bound inside Feature Grid. |
| Word Catalog | Filter panel, results grid and pagination in one droppable block. |
| Resource Banner | Sky-blue call-out with a round image, heading, copy and a button. |
| Site Footer | Wordmark, acknowledgement of Country, policy links. |

The home page's full-width painting between header and Angke banner is a native Webflow Image block, not a component.

### The three inside Word Catalog

`WordCatalog` is a thin layout wrapper over three modules that are still fully independent:

| Module | What it does |
| --- | --- |
| `FilterPanel` | Keyword search, the theme tree, and a bird-group facet. Writes filter state. |
| `WordGrid` | The results grid, 12 per page. Reads filter state. |
| `Pagination` | Pages the grid. Hides itself when everything fits on one page. |

None of them import each other. Adding a `.webflow.tsx` declaration next to any one of them publishes it as its own
Webflow component, and the three then coordinate across separate shadow roots exactly as they do inside the wrapper.

### How they talk to each other

Each code component mounts in **its own Shadow DOM with its own React root**, so Context, Redux and module-level
singletons do not cross between them. `src/lib/catalog-state.ts` uses the URL query string as the shared store
instead: Filter Panel writes, Word Grid and Pagination read, and a custom event plus `popstate` wakes everyone up.

Practical effects:

- Inside `WordCatalog` they share one React root, but nothing depends on that.
- Published separately, they can sit anywhere on the same page in any order and stay in step.
- Filter state is shareable and bookmarkable - `?q=owl&group=Songbirds&page=2`.
- `selectWords()` is the single definition of "what is showing", imported by both the grid and pagination so their
  idea of the result set cannot drift apart.
- If `history.replaceState` is blocked - a sandboxed Designer canvas, say - state falls back to memory, so the UI
  keeps working and only loses its shareable URL.

## Data

`src/data/words.ts` - 118 entries combed from two community sources on kaytetye.com.au:

| Source | What it gives | Count |
| --- | --- | --- |
| [thangkerne.kaytetye.com.au](https://thangkerne.kaytetye.com.au/) | Bird entries with a photo, an audio recording, a scientific name and a story with its translation | 40 |
| [kaytetye.com.au/definitions.html](https://kaytetye.com.au/definitions.html) | Plant and animal definitions written in Kaytetye and English by the late Alison Nangala Ross in 1997 | 98 |

Twenty entries appear in both and are merged, so a bird can carry a photo, a recording, a story *and* a definition -
hence 118 rather than 138. The words, recordings, images, stories and definitions are the community's own.

### Facets

Every leaf has entries behind it; nothing renders as a dead zero.

```
Animals 107
  Thangkerne (flying creatures)   60
  Weye (meat)                     23
  Apmwe (snakes)                   5
  Other animals                   32
Rlwene (plants) 11
  Fruits and vegetables            2
  Ngkwarle (sweet food-delicacies) 4
  Other plants                     6
Media
  Has a photo    40
  Has a recording 40
  Has a story     38
```

Themes are OR within the facet - tick two leaves, see both. Media is AND - "has a photo" plus "has a recording"
means both. Counts ignore their own facet so the other options stay pickable. Sort is Photos first (default),
Kaytetye A-Z, or English A-Z; photos-first is the default because 78 of the 118 entries have no image and an
alphabetical default leaves the grid looking half empty. Entries without a photo get a tile showing the Kaytetye word.

All of it is in the URL: `?theme=weye&media=photo&sort=gloss&page=2`.

### How the themes were assigned

**Derived, not authored.** The top level comes from the definitions page's own Animals/Plants headings. The leaves
come from keywords in the English gloss and definition - a bird gloss becomes `thangkerne`, "good to eat" or "is
meat" becomes `weye`, "snake" becomes `apmwe`, and so on. Every entry keeps its `defEnglish`, so any tag can be
checked against the sentence it was read from.

This is good enough to exercise filters and no more. It is not authoritative Kaytetye classification, and the
Figma's fuller taxonomy (Kayte, Nterrenge, Arntwe, Arntetyewe arelhe, Mpwarenkarle inenge) is not represented
because these two sources don't support it. Real categories need to come from the community, not from keyword
matching.

**Before this goes past a spike:** the image and audio URLs point straight at thangkerne.kaytetye.com.au.
Hotlinking a community site's assets is not on for anything real - move them into Webflow assets first.

## Fonts

The design uses **VC Henrietta Trial** (display) and **Geist Mono** (everything else). Henrietta is a trial licence
and isn't loadable, so `--font-display` falls back to Fraunces, then Georgia. Geist Mono is on Google Fonts.
Add both in Webflow site settings; the Shadow DOM inherits `font-family` from the page.

## Styling

Tailwind v4 through PostCSS, with `src/globals.css` imported by `src/globals.ts` and declared as `library.globals` -
Webflow's documented route for getting a stylesheet into every shadow root. shadcn/ui components live in
`src/components/ui/`, and `webpack.webflow.cjs` provides the `@` path alias they need.

Two gotchas already fixed, worth knowing if you add more:

- **Radix portals.** `SelectContent` takes a `container` prop, pointed at an element inside the component. Radix
  defaults to `document.body`, which is outside the shadow root, so a portalled dropdown renders unstyled. Any
  popover, tooltip or dialog you add needs the same treatment.
- **`webpack.webflow.cjs`, not `.js`.** `package.json` is `"type": "module"`, so a `module.exports` config file has
  to carry the `.cjs` extension or the bundler dies on `module is not defined in ES module scope`.
