import type { CSSProperties, ReactNode } from "react";
import { typeSize, tokenValue, type ColourOption } from "@/src/tokens";
import { Icon } from "./Icon";

/**
 * v3 Breadcrumb — port of v1's e_breadcrumb: Home plus up to three items,
 * forward-slash separators, breadcrumb tag sizing from the site variables.
 */
export type BreadcrumbLink = { href: string; target?: string };

export type BreadcrumbProps = {
  homeText?: ReactNode;
  homeLink?: BreadcrumbLink;
  item1Text?: ReactNode;
  item1Link?: BreadcrumbLink;
  showItem2?: boolean;
  item2Text?: ReactNode;
  item2Link?: BreadcrumbLink;
  showItem3?: boolean;
  item3Text?: ReactNode;
  item3Link?: BreadcrumbLink;
  colour?: ColourOption;
};

const CRUMB_CSS = `
.crumbs { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5em; }
.crumbs a { color: currentColor; text-decoration: none; }
.crumbs a:hover { text-decoration: underline; }
.crumbs a:focus-visible { outline: 0.125rem solid currentColor; outline-offset: 0.125rem; }
`;

function Crumb({ text, link }: { text?: ReactNode; link?: BreadcrumbLink }) {
  if (text === undefined || text === null || text === "") return null;
  return link?.href ? (
    <a href={link.href} target={link.target}>
      {text}
    </a>
  ) : (
    <span>{text}</span>
  );
}

const Sep = () => <Icon glyph="forward-slash" size="small" />;

export function Breadcrumb({
  homeText = "Home",
  homeLink,
  item1Text = "Page",
  item1Link,
  showItem2 = false,
  item2Text,
  item2Link,
  showItem3 = false,
  item3Text,
  item3Link,
  colour = "inherit",
}: BreadcrumbProps) {
  const sized = typeSize("breadcrumb");
  const style: CSSProperties = {
    fontSize: sized.fontSize,
    lineHeight: sized.lineHeight,
    color: tokenValue("colour", colour),
  };
  return (
    <nav className="crumbs" aria-label="Breadcrumb" style={style}>
      <style>{CRUMB_CSS}</style>
      <Crumb text={homeText} link={homeLink} />
      <Sep />
      <Crumb text={item1Text} link={item1Link} />
      {showItem2 && (
        <>
          <Sep />
          <Crumb text={item2Text} link={item2Link} />
        </>
      )}
      {showItem3 && (
        <>
          <Sep />
          <Crumb text={item3Text} link={item3Link} />
        </>
      )}
    </nav>
  );
}
