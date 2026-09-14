export type ResourceBannerProps = {
  heading?: string;
  body?: string;
  ctaLabel?: string;
  cta?: { href: string; target?: string };
  image?: { src: string; alt?: string };
};

export function ResourceBanner({
  heading = "Other resources",
  body = "",
  ctaLabel = "Learn more",
  cta = { href: "#" },
  image,
}: ResourceBannerProps) {
  return (
    <section className="bg-sky font-mono w-full px-8 py-16">
      <div className="mx-auto grid max-w-[1376px] items-center gap-16 md:grid-cols-2">
        {image?.src ? (
          <img
            src={image.src}
            alt={image.alt ?? ""}
            className="aspect-square w-full max-w-[380px] rounded-full object-cover"
          />
        ) : (
          <div className="bg-country/10 aspect-square w-full max-w-[380px] rounded-full" />
        )}

        <div className="flex flex-col items-start gap-5">
          <h2 className="text-country font-display text-[44px] leading-[48px] tracking-wide">
            {heading}
          </h2>
          {body && (
            <p className="text-country max-w-[52ch] text-base leading-6 font-medium">
              {body}
            </p>
          )}
          {ctaLabel && (
            <a
              href={cta.href}
              target={cta.target}
              className="bg-country text-sky rounded-sm px-5 py-3 text-base font-medium"
            >
              {ctaLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
