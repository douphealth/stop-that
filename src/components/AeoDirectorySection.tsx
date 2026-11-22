import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, Sparkles } from "lucide-react";
import { apps, emptyFilters, fixes } from "@/lib/fixes";
import { AppBadge } from "@/components/AppBadge";

const HOMEPAGE_FAQS = [
  {
    q: "Can you turn off YouTube autoplay and feed previews completely?",
    a: "Yes. YouTube documents confirmed off switches on iPhone and Android for both next-video autoplay and silent Home feed autoplay previews. Each fix takes about 1 minute in YouTube Settings and can be reversed at any time.",
  },
  {
    q: "Can I stop Uber Eats promotional notifications without missing delivery updates?",
    a: "On Android, you can often switch off promotional notification categories in Android App notifications while leaving Orders and Delivery alerts on. On iPhone, iOS has no guaranteed system-level Promotions switch for Uber Eats, so check in-app notification preferences first.",
  },
  {
    q: "How do I turn off Apple Intelligence AI notification summaries on iPhone?",
    a: "Apple documents a dedicated switch in iPhone Settings → Notifications → Summarize Notifications where you can disable AI-generated summaries globally or per app, alongside separate toggles for Priority Notifications and Apple Mail AI summaries.",
  },
  {
    q: "How do I stop websites from showing Chrome notification pop-ups?",
    a: "On desktop Chrome and Android Chrome, open Settings → Privacy and security → Site settings → Notifications to block site notification requests or switch to quieter messaging, plus use Pop-ups and redirects to block intrusive windows.",
  },
  {
    q: "What do 'Can disable', 'Can reduce', and 'No confirmed switch' mean?",
    a: "'Can disable' means official vendor documentation describes a direct off switch. 'Can reduce' means a partial control or workaround is documented. 'No confirmed switch' means no guaranteed switch is documented in the official source we reviewed.",
  },
  {
    q: "Are STOP THAT! instructions AI-generated or device-tested?",
    a: "No steps are AI-guessed. Every fix links directly to official OS vendor or app-maker documentation and lists its documentation review date. Hands-on device testing is not claimed where it is not recorded.",
  },
];

export function AeoDirectorySection({ onSelectApp }: { onSelectApp: (app: string) => void }) {
  const appGroups = apps.map((app) => {
    const list = fixes.filter((f) => f.app === app);
    const disable = list.filter((f) => f.status === "disable").length;
    const reduce = list.filter((f) => f.status === "reduce").length;
    return { app, list, disable, reduce };
  });

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOMEPAGE_FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="mt-16 space-y-14 border-t border-border pt-12">
      {/* Crawlable 19-App Authority Directory for Internal Linking & Topical SEO */}
      <section aria-labelledby="app-directory-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
              Browse by App · Internal Directory
            </p>
            <h2 id="app-directory-heading" className="mt-1.5 font-display text-2xl font-extrabold sm:text-3xl">
              Every supported app &amp; its top fixes
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {apps.length} apps · {fixes.length} official-source guides
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {appGroups.map(({ app, list, disable, reduce }) => (
            <div key={app} className="spotlight-card flex flex-col rounded-2xl p-4">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectApp(app);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex items-center gap-2.5 text-left hover:text-primary"
                >
                  <AppBadge app={app} />
                  <div>
                    <h3 className="font-display text-base font-bold leading-tight">{app}</h3>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {list.length} {list.length === 1 ? "fix" : "fixes"} · {disable} disable
                      {reduce > 0 ? ` · ${reduce} reduce` : ""}
                    </p>
                  </div>
                </button>
                <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {Math.round((disable / Math.max(1, list.length)) * 100)}% off
                </span>
              </div>

              <ul className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs">
                {list.slice(0, 2).map((fix) => (
                  <li key={fix.slug}>
                    <Link
                      to="/fix/$slug"
                      params={{ slug: fix.slug }}
                      search={emptyFilters}
                      className="flex items-center justify-between gap-2 text-muted-foreground transition hover:text-primary"
                    >
                      <span className="truncate">{fix.title}</span>
                      <ArrowUpRight className="size-3 shrink-0 opacity-60" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* AEO / GEO Quick Answers FAQ Block */}
      <section aria-labelledby="aeo-faq-heading" className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <p className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="size-3.5" /> Quick Answers
          </p>
          <h2 id="aeo-faq-heading" className="mt-1.5 font-display text-2xl font-extrabold sm:text-3xl">
            Frequently asked questions about silencing apps
          </h2>
        </div>

        <div className="space-y-2.5">
          {HOMEPAGE_FAQS.map((item, idx) => (
            <details key={item.q} open={idx === 0} className="glass-surface rounded-2xl">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-semibold sm:text-base">
                <span>{item.q}</span>
                <ChevronDown className="faq-chevron size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
              </summary>
              <p
                data-aeo-answer="true"
                className="border-t border-border px-4 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground"
              >
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </section>
    </div>
  );
}
