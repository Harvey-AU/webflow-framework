export type SiteFooterProps = {
  wordmark?: string;
  broughtToYouBy?: string;
  acknowledgement?: string;
  termsLabel?: string;
  terms?: { href: string; target?: string };
  copyright?: string;
};

export function SiteFooter({
  wordmark = "Kaytetye",
  broughtToYouBy = "Brought to you by",
  acknowledgement = "We acknowledge all First Peoples of this land and celebrate their enduring connections to Country, knowledge and stories. We pay our respects to Elders and Ancestors who watch over us and guide Aboriginal and Torres Strait Islander community.",
  termsLabel = "Terms & Policies",
  terms = { href: "#" },
  copyright = "© Kaytetye",
}: SiteFooterProps) {
  return (
    <footer className="bg-country font-mono w-full px-8 py-14">
      <div className="mx-auto flex max-w-[1376px] flex-wrap items-start justify-between gap-10">
        <div className="flex items-center gap-4">
          <span className="text-cream font-display text-xl tracking-wide">{wordmark}</span>
          <span className="bg-sky/40 h-8 w-px" />
          <span className="text-sky max-w-[7ch] text-[10px] leading-[14px] font-medium tracking-wide">
            {broughtToYouBy}
          </span>
        </div>

        <p className="text-sky max-w-[46ch] text-xs leading-[18px] font-semibold">
          {acknowledgement}
        </p>

        <div className="text-sky flex flex-col gap-1 text-xs font-semibold">
          <a href={terms.href} target={terms.target} className="hover:underline">
            {termsLabel}
          </a>
          <span>{copyright}</span>
        </div>
      </div>
    </footer>
  );
}
