export type FeatureCardProps = {
  title?: string;
  gloss?: string;
  image?: { src: string; alt?: string };
  link?: { href: string; target?: string };
};

export function FeatureCard({
  title = "Apmere",
  gloss = "(Country)",
  image,
  link = { href: "#" },
}: FeatureCardProps) {
  return (
    <a
      href={link.href}
      target={link.target}
      className="font-mono group flex w-full flex-col gap-3 no-underline"
    >
      {image?.src ? (
        <img
          src={image.src}
          alt={image.alt ?? ""}
          loading="lazy"
          className="aspect-square w-full rounded-md object-cover"
        />
      ) : (
        <div className="bg-country/10 text-country/70 font-display flex aspect-square w-full items-center justify-center rounded-md px-4 text-center text-2xl tracking-wide">
          {title}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <h3 className="text-country font-display text-lg leading-[26px] tracking-wide group-hover:underline">
          {title}
        </h3>
        {gloss && <p className="text-country text-sm leading-5 font-semibold">{gloss}</p>}
      </div>
    </a>
  );
}
