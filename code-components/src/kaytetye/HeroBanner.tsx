export type HeroBannerProps = {
  breadcrumb?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  image?: { src: string; alt?: string };
};

export function HeroBanner({
  breadcrumb = "Home / Words / Apmere",
  title = "Apmere",
  subtitle = "(Country)",
  body = "",
  image,
}: HeroBannerProps) {
  const crumbs = breadcrumb.split("/").map((c) => c.trim()).filter(Boolean);

  return (
    <section className="bg-country font-mono w-full">
      {crumbs.length > 0 && (
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-8 py-3 text-xs font-semibold text-cream">
          {crumbs.map((crumb, i) => (
            <span key={crumb + i} className="flex items-center gap-2">
              {i > 0 && <span className="text-[10px] text-white/70">/</span>}
              <span>{crumb}</span>
            </span>
          ))}
        </div>
      )}

      <div className="mx-auto grid max-w-[1440px] items-center gap-16 px-8 pb-8 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-sky font-display text-[44px] leading-[48px] tracking-wide">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sky font-display text-2xl leading-[30px] tracking-wide">
              {subtitle}
            </p>
          )}
          {body && (
            <p className="text-sky-soft mt-2 max-w-[52ch] text-base leading-6 font-medium">
              {body}
            </p>
          )}
        </div>
        {image?.src && (
          <img
            src={image.src}
            alt={image.alt ?? ""}
            className="ml-auto max-h-[300px] w-full max-w-[560px] object-contain"
          />
        )}
      </div>
    </section>
  );
}
