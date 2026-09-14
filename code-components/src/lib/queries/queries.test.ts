/**
 * Checks the queries against an in-memory client.
 *
 * Run with: npm run test:queries
 *
 * The point is that this file needs no token, no network and no Webflow site:
 * a query only knows the `CmsClient` port, so `createStaticClient` can stand in
 * for `createWebflowClient` exactly. If a query ever reaches for Webflow
 * directly, this stops compiling or stops passing.
 */
import assert from "node:assert/strict";
import { createStaticClient } from "../cms/static";
import type { CmsRecord } from "../cms/types";
import { catalogQuery } from "./catalog";
import { navQuery } from "./nav";

const record = (id: string, fields: Record<string, unknown>): CmsRecord => ({ id, fields });

// --- nav -------------------------------------------------------------------
const nav = createStaticClient({
  "nav-items": [
    record("n3", { name: "About", link: "/about", order: 3 }),
    record("n1", { name: "Words", link: "/words", order: 1 }),
    record("n2", { name: "Dictionary", link: "https://example.org", order: 2, "open-in-new-tab": true }),
    // No link: a nav item that would render as a dead anchor.
    record("n4", { name: "Broken", order: 4 }),
  ],
});

const { nav: links } = await navQuery(nav);
assert.deepEqual(
  links.map((l) => l.label),
  ["Words", "Dictionary", "About"],
  "nav is ordered by the Order field, and the link-less item is dropped",
);
assert.equal(links[1].newTab, true, "the switch field becomes newTab");
assert.equal(links[0].newTab, false, "an absent switch is false, not undefined");

// --- catalog ---------------------------------------------------------------
// `w2` points at `w1` through related-words, so resolving it proves the query
// indexes every word before joining rather than walking the list in order.
const catalog = createStaticClient({
  words: [
    record("w1", {
      slug: "ngimarre",
      name: "Ngimarre",
      "english-name": "budgerigar",
      classifiers: ["t3", "t4"],
      image: "https://cdn.example/ngimarre.jpg",
      "external-links": ["r1"],
    }),
    record("w2", {
      slug: "wampere",
      name: "Wampere",
      "english-name": "bat",
      classifiers: ["t3"],
      "related-words": ["w1"],
    }),
    // No slug: nothing could link to it, so it must not reach the grid.
    record("w3", { name: "Unslugged", classifiers: ["t3"] }),
  ],
  themes: [
    record("t1", { slug: "apmere-country", name: "Apmere (Country)", "parent-theme": null }),
    record("t2", { slug: "animals", name: "Animals", "parent-theme": "t1" }),
    record("t3", { slug: "thangkerne", name: "Thangkerne (flying creatures)", "parent-theme": "t2" }),
    record("t4", { slug: "weye", name: "Weye (meat)", "parent-theme": "t2" }),
  ],
  resources: [
    record("r1", {
      slug: "thangkerne-recordings",
      name: "Thangkerne recordings",
      "resource-type": "rt1",
      link: "https://thangkerne.example",
      image: "https://cdn.example/cover.jpg",
      "topic-tags": ["t3"],
    }),
  ],
  "resource-types": [record("rt1", { name: "Audio", slug: "audio" })],
});

const data = await catalogQuery(catalog);

assert.deepEqual(
  data.entries.map((e) => e.slug),
  ["ngimarre", "wampere"],
  "a word with no slug is dropped",
);
assert.deepEqual(
  data.entries[0].themes,
  ["thangkerne", "weye"],
  "classifier ids resolve to theme slugs",
);
assert.equal(
  data.entries[0].image,
  "https://cdn.example/ngimarre.jpg",
  "an image field reads as a plain URL, whatever wrapper the source used",
);

// A word referencing one that appears earlier in the list, resolved by id.
assert.deepEqual(
  data.details.wampere.relatedWords.map((w) => w.slug),
  ["ngimarre"],
  "related words resolve across the whole collection, not by position",
);

// The third level: word -> resource -> the resource's own type and tags.
const resource = data.details.ngimarre.resources[0];
assert.equal(resource.name, "Thangkerne recordings");
assert.equal(resource.type, "Audio", "the resource's own reference is resolved too");
assert.deepEqual(resource.topicTags.map((t) => t.label), ["Thangkerne (flying creatures)"]);

// The reverse lookup: themes carry no field pointing at words.
const flying = data.themeGroups.find((g) => g.theme.id === "thangkerne");
assert.ok(flying, "expected a group for the theme both words are tagged with");
assert.deepEqual(
  flying.words.map((w) => w.slug),
  ["ngimarre", "wampere"],
  "both words appear under the theme they tag",
);
assert.ok(
  !data.themeGroups.some((g) => g.theme.id === "animals"),
  "a category no word tags directly gets no group",
);

// Only the two used classifiers survive, under their category.
assert.deepEqual(data.themeTree.map((n) => n.id), ["animals"]);
assert.deepEqual(data.themeTree[0].children?.map((c) => c.id), ["thangkerne", "weye"]);

// --- the port's contract ---------------------------------------------------
await assert.rejects(
  () => navQuery(createStaticClient({})),
  /no records for "nav-items"/,
  "a missing collection fails loudly rather than rendering empty",
);

console.log("queries: all assertions passed");
