/**
 * Checks the joins a Webflow Collection List cannot express.
 *
 * Run with: npm run test:join
 *
 * The case that matters is the reverse lookup. In the CMS, a child references
 * its parent - an Article points at a Blog, a Word points at its Themes. A
 * Collection List can only follow that forwards, so it can render the Blog for
 * an Article but not the Articles for a Blog. `groupByTag` inverts it.
 */
import assert from "node:assert/strict";
import { groupByTag, themeIndex, buildThemeTree } from "./catalog-join";
import type { CmsRecord } from "./cms/types";
import type { EntryDetail } from "./catalog-types";

function word(slug: string, themes: string[]): EntryDetail {
  return {
    slug,
    word: slug,
    gloss: "",
    scientific: "",
    image: null,
    audio: null,
    definition: "",
    examples: "",
    themes,
    themeRefs: [],
    resources: [],
    relatedWords: [],
  };
}

function theme(id: string, slug: string, name: string, parent: string | null): CmsRecord {
  return { id, fields: { slug, name, "parent-theme": parent } };
}

// --- the reverse lookup -----------------------------------------------------
// Three words, each tagging its themes. Nothing points from theme to word.
const words = [
  word("ngimarre", ["thangkerne-flying-creatures", "weye-meat"]),
  word("wampere", ["thangkerne-flying-creatures"]),
  word("arnanpe", ["arntetyewe-arelhe-medicines"]),
];

const groups = groupByTag(words, (slug) => slug.toUpperCase(), [
  "thangkerne-flying-creatures",
  "weye-meat",
  "arntetyewe-arelhe-medicines",
  "apmwe-snakes", // tagged by nothing
]);

// A tag with no children is dropped rather than rendered as an empty group.
assert.equal(groups.length, 3, "empty tags should not produce a group");
assert.ok(
  !groups.some((g) => g.theme.id === "apmwe-snakes"),
  "a tag no word references must not appear",
);

const flying = groups.find((g) => g.theme.id === "thangkerne-flying-creatures");
assert.ok(flying, "expected a group for the flying-creatures tag");
assert.deepEqual(
  flying.words.map((w) => w.slug),
  ["ngimarre", "wampere"],
  "both words tagged with the theme should appear under it, sorted",
);

// A word tagged with two themes appears under both. This is the case a nested
// Collection List cannot produce at all.
const meat = groups.find((g) => g.theme.id === "weye-meat");
assert.ok(meat, "expected a group for the meat tag");
assert.deepEqual(meat.words.map((w) => w.slug), ["ngimarre"]);
assert.ok(
  flying.words.some((w) => w.slug === "ngimarre") &&
    meat.words.some((w) => w.slug === "ngimarre"),
  "a multi-tagged word must appear under every tag it carries",
);

assert.equal(flying.theme.label, "THANGKERNE-FLYING-CREATURES", "label resolver is applied");

// --- the self-referential tree ---------------------------------------------
// Themes reference their own parent, so the tree is built by walking up twice:
// no parent = the top-level Theme, parent-with-no-parent = a Category.
const themeItems = [
  theme("t1", "apmere-country", "Apmere (Country)", null),
  theme("t2", "animals", "Animals", "t1"),
  theme("t3", "weye-meat", "Weye (meat)", "t2"),
  theme("t4", "apmwe-snakes", "Apmwe (snakes)", "t2"),
  theme("t5", "elements", "Elements", "t1"),
  theme("t6", "arntwe-water", "Arntwe (water)", "t5"),
];

const tree = buildThemeTree(themeItems, new Set(["weye-meat", "apmwe-snakes", "arntwe-water"]));

// The top-level Theme is skipped: the panel starts at Category level.
assert.deepEqual(
  tree.map((n) => n.id),
  ["animals", "elements"],
  "categories become the roots, the top-level theme is skipped",
);
assert.deepEqual(
  tree.find((n) => n.id === "animals")?.children?.map((c) => c.id),
  ["apmwe-snakes", "weye-meat"],
  "classifiers nest under their category, sorted by label",
);

// A category whose classifiers are all unused should not survive.
const sparse = buildThemeTree(themeItems, new Set(["arntwe-water"]));
assert.deepEqual(
  sparse.map((n) => n.id),
  ["elements"],
  "categories with no used classifiers are dropped",
);

// --- index integrity --------------------------------------------------------
const { bySlug, byId } = themeIndex(themeItems);
assert.equal(byId.get("t3"), "weye-meat", "ids map to slugs");
assert.equal(bySlug.get("weye-meat")?.parent, "t2", "parent is kept as an id");

console.log("catalog-join: all assertions passed");
