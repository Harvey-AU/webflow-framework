import type { CSSProperties, ReactNode } from "react";

export type FeatureGridProps = {
  title?: string;
  subtitle?: string;
  viewAllLabel?: string;
  viewAll?: { href: string; target?: string };
  columns?: number;
  /** Drop Feature Cards, or a Collection List of them, in here. */
  cards?: ReactNode;
};

export function FeatureGrid({
  title = "Apmere",
  subtitle = "(Country)",
  viewAllLabel = "View all",
  viewAll = { href: "#" },
  columns = 4,
  cards,
}: FeatureGridProps) {
  return (
    <section className="bg-cream font-mono w-full px-8 py-16">
      <div className="mx-auto flex max-w-[1376px] flex-col gap-10">
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col gap-3">
            <h2 className="text-country font-display text-[44px] leading-[48px] tracking-wide">
              {title}
            </h2>
            {subtitle && (
              <p className="text-country font-display text-2xl leading-[30px] tracking-wide">
                {subtitle}
              </p>
            )}
          </div>
          {viewAllLabel && (
            <a
              href={viewAll.href}
              target={viewAll.target}
              className="text-country text-base leading-6 font-medium hover:underline"
            >
              {viewAllLabel}
            </a>
          )}
        </div>
        <div
          className="grid grid-cols-[repeat(var(--cols),minmax(0,1fr))] gap-6 max-md:grid-cols-2 max-sm:grid-cols-1"
          style={{ "--cols": columns } as CSSProperties}
        >
          {cards}
        </div>
      </div>
    </section>
  );
}
