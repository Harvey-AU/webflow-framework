/**
 * Site-wide defaults for the Kaytetye components.
 *
 * Components take these as props rather than reaching for them directly, so a
 * host (the Webflow Designer, the local preview, or a future Code Function that
 * reads the CMS) can pass its own values in. This file is the one place a
 * default is written down; nothing is hardcoded inside a component.
 */

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
