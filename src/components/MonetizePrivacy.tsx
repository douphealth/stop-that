import { SEO } from "@/seo.config";
import { AMAZON, OFFER_LINKS, OFFER_SLOTS } from "@/monetize.config";

/** Privacy sections that switch on with the monetization config, so the policy always matches what ships. */
export function monetizeState() {
  return {
    amazon: Boolean(AMAZON.tag),
    partners: Object.values(OFFER_SLOTS).some((s) => (s as { url: string }).url) || Object.keys(OFFER_LINKS).length > 0,
    ads: Boolean(String((SEO as { adsenseClient?: string }).adsenseClient ?? "").trim()),
  };
}

export function MonetizePrivacy() {
  const m = monetizeState();
  return (
    <>
      {(m.amazon || m.partners) && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Affiliate and partner links</h2>
          <p className="mt-2 text-muted-foreground">Some pages contain clearly labelled partner links.{m.amazon ? " As an Amazon Associate we earn from qualifying purchases." : ""} If you follow one, the partner may set cookies to attribute a purchase or quote; its own privacy notice applies on its site. We do not share your data with partners, and links never change our research.</p>
        </section>
      )}
      {m.ads && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Advertising</h2>
          <p className="mt-2 text-muted-foreground">We show ads served by Google. Google and its partners may use cookies or similar technologies to serve and measure ads, subject to your consent where the law requires it. Manage ad personalisation at <a className="text-primary underline-offset-4 hover:underline" href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ad Settings</a> and read <a className="text-primary underline-offset-4 hover:underline" href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">how Google uses data from partner sites</a>.</p>
        </section>
      )}
    </>
  );
}
