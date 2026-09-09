/**
 * Site-wide defaults for the Kaytetye components.
 *
 * Components take these as props rather than reaching for them directly, so a
 * host (the Webflow Designer, a local preview, a different CMS behind the same
 * query) can pass its own values in. This file is the one place a default is
 * written down; nothing is hardcoded inside a component, and nothing falls back
 * inside one either.
 */

import type { CatalogData } from "@/src/lib/catalog-types";

export type NavItem = {
  label: string;
  href: string;
  /** Set by CMS-sourced items; the defaults below all stay in the same tab. */
  newTab?: boolean;
};

/** Header and mobile-dropdown navigation, per the Buttons/Nav design frame. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Words", href: "/words" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
];

/**
 * What the catalog renders with before or without a CMS.
 *
 * Empty rather than sample words: a filter panel with nothing behind it is an
 * honest empty state, whereas placeholder words look like real content.
 */
export const EMPTY_CATALOG: CatalogData = {
  entries: [],
  themeTree: [],
  details: {},
  themeGroups: [],
};
