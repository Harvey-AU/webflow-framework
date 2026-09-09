import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS, type NavItem } from "@/src/config/site";

export type SiteHeaderProps = {
  wordmark?: string;
  home?: { href: string; target?: string };
  /** Drop Webflow links in here. Takes precedence over `navItems`. */
  nav?: ReactNode;
  /**
   * Links to render when the Nav slot is empty. Defaults to the site config so
   * the component holds no nav of its own; pass `[]` for a wordmark-only header.
   */
  navItems?: NavItem[];
};

export function SiteHeader({
  wordmark = "Kaytetye",
  home = { href: "/" },
  nav,
  navItems = NAV_ITEMS,
}: SiteHeaderProps) {
  const hasNav = Array.isArray(nav) ? nav.length > 0 : Boolean(nav);
  const [open, setOpen] = useState(false);

  const links = hasNav
    ? nav
    : navItems.map(({ label, href }) => (
        <a key={label} href={href} className="hover:underline">
          {label}
        </a>
      ));

  return (
    <header className="bg-cream font-mono w-full max-md:px-5 max-md:py-3 md:px-8 md:py-3">
      <div className="mx-auto flex max-w-[1376px] items-center justify-between gap-8">
        <a
          href={home.href}
          target={home.target}
          className="text-country font-display text-xl leading-6 tracking-wide"
        >
          {wordmark}
        </a>

        {/* Below md the three links move into the dropdown below. */}
        <nav className="text-country hidden items-center gap-8 text-base font-medium md:flex">
          {links}
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="kt-mobile-nav"
          onClick={() => setOpen((o) => !o)}
          className="text-country cursor-pointer md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Full-width panel under a rule, per the mobile nav dropdown frame. */}
      <nav
        id="kt-mobile-nav"
        hidden={!open}
        className="text-country border-country -mx-5 mt-3 flex flex-col gap-4 border-t px-5 py-3 text-base font-medium md:hidden"
      >
        {links}
      </nav>
    </header>
  );
}
