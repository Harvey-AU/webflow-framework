import type { ReactNode } from "react";

export type SiteHeaderProps = {
  wordmark?: string;
  home?: { href: string; target?: string };
  /** Drop Webflow links in here. Falls back to the links from the design. */
  nav?: ReactNode;
};

const FALLBACK_NAV = ["Words", "Resources", "About"];

export function SiteHeader({
  wordmark = "Kaytetye",
  home = { href: "/" },
  nav,
}: SiteHeaderProps) {
  const hasNav = Array.isArray(nav) ? nav.length > 0 : Boolean(nav);

  return (
    <header className="bg-cream font-mono w-full px-8 py-3">
      <div className="mx-auto flex max-w-[1376px] items-center justify-between gap-8">
        <a
          href={home.href}
          target={home.target}
          className="text-country font-display text-xl leading-6 tracking-wide"
        >
          {wordmark}
        </a>
        <nav className="text-country flex items-center gap-8 text-base font-medium">
          {hasNav
            ? nav
            : FALLBACK_NAV.map((label) => (
                <a key={label} href="#" className="hover:underline">
                  {label}
                </a>
              ))}
        </nav>
      </div>
    </header>
  );
}
