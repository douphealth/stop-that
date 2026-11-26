import { createFileRoute, Link, notFound, stripSearchParams } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Copy,
  RotateCcw,
  ShieldCheck,
  VolumeX,
  Zap,
} from "lucide-react";
import { deviceLabel, emptyFilters, fixes, statusLabel } from "@/lib/fixes";
import { filterSearch } from "@/lib/filter-search";
import { StatusBadge } from "@/components/StatusBadge";
import { AppBadge } from "@/components/AppBadge";
import { OfferSlot } from "@/components/OfferSlot";
import { DATA_REMOVAL_CATEGORIES, FOCUS_BLOCKER_CATEGORIES } from "@/monetize.config";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useSaved } from "@/lib/saved";
import { useSilenced } from "@/lib/app-theme";
import { fixFaq, otherDevices, sameCategory, shortAnswer } from "@/lib/fix-content";

const DEVICE_LABEL: Record<string, string> = {
  iphone: "iPhone",
  android: "Android",
  desktop: "desktop",
  "all-mobile": "iPhone and Android",
  all: "every device",
};

/** Unique meta description: the summary plus the device it covers (iPhone and Android variants otherwise share one). */
function metaDescription(fix: { summary: string; device: string; metaDescription?: string | undefined }) {
  if (fix.metaDescription) return fix.metaDescription;
  const label = DEVICE_LABEL[fix.device] ?? fix.device;
  if (new RegExp(label.split(" ")[0] ?? label, "i").test(fix.summary)) return fix.summary;
  return `${fix.summary.replace(/\.?$/, ".")} Step-by-step for ${label}.`;
}

export const Route = createFileRoute("/fix/$slug")({
  validateSearch: filterSearch,
  search: { middlewares: [stripSearchParams(emptyFilters)] },
  loader: ({ params }) => {
    const fix = fixes.find((f) => f.slug === params.slug);
    if (!fix) throw notFound();
    return { fix };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.fix.title} | STOP THAT!` : "Fix unavailable | STOP THAT!" },
      { name: "description", content: loaderData ? metaDescription(loaderData.fix) : "This fix is unavailable." },
      { property: "og:title", content: loaderData?.fix.title ?? "Fix unavailable | STOP THAT!" },
      {
        property: "og:description",
        content: loaderData ? metaDescription(loaderData.fix) : "Return to the STOP THAT! directory.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              name: loaderData.fix.title,
              description: loaderData.fix.summary,
              totalTime: `PT${parseInt(loaderData.fix.estimatedTime, 10) || 1}M`,
              dateModified: loaderData.fix.reviewed,
              isBasedOn: [loaderData.fix.source.url, ...(loaderData.fix.moreSources ?? []).map((m) => m.url)],
              tool: [
                { "@type": "HowToTool", name: loaderData.fix.app },
                { "@type": "HowToTool", name: deviceLabel[loaderData.fix.device] ?? loaderData.fix.device },
              ],
              speakable: {
                "@type": "SpeakableSpecification",
                cssSelector: ["h1", "[data-aeo-answer]"],
              },
              step: loaderData.fix.steps.map((text, i) => ({
                "@type": "HowToStep",
                position: i + 1,
                name: `Step ${i + 1}`,
                text,
              })),
            }),
          },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="text-4xl font-bold">That fix doesn't exist.</h1>
      <Link to="/" className="mt-6 inline-block text-primary">
        ← Back to all fixes
      </Link>
    </div>
  ),
  component: FixPage,
});

function FormattedStep({ text }: { text: string }) {
  const parts = text.split("→");
  if (parts.length < 2) return <>{text}</>;
  return (
    <>
      {parts.map((part, idx) => {
        const trimmed = part.trim();
        let content: React.ReactNode = trimmed;
        if (idx === 0) {
          const m = trimmed.match(/^(Open|Go to|Tap|Select|In|Choose|Click)\s+(.+)$/i);
          if (m) {
            content = (
              <>
                {m[1]} <span className="path-chip">{m[2]}</span>
              </>
            );
          }
        } else if (idx === parts.length - 1) {
          const dotIdx = trimmed.indexOf(".");
          if (dotIdx > 0 && dotIdx < 48) {
            content = (
              <>
                <span className="path-chip">{trimmed.slice(0, dotIdx)}</span>
                {trimmed.slice(dotIdx)}
              </>
            );
          } else if (trimmed.length <= 42) {
            content = <span className="path-chip">{trimmed}</span>;
          }
        } else if (trimmed.length <= 42) {
          content = <span className="path-chip">{trimmed}</span>;
        }
        return (
          <Fragment key={idx}>
            {idx > 0 && <span className="mx-1 font-bold text-primary">→</span>}
            {content}
          </Fragment>
        );
      })}
    </>
  );
}

function FixPage() {
  const { fix } = Route.useLoaderData();
  return <FixContent key={fix.slug} fix={fix} />;
}

function FixContent({ fix }: { fix: (typeof fixes)[number] }) {
  const filters = Route.useSearch();
  const [done, setDone] = useState<number[]>([]);
  const [copyState, setCopyState] = useState("");
  const { saved, toggle } = useSaved();
  const { silenced, toggleSilenced, markSilenced } = useSilenced();

  const related = fixes.filter((f) => f.app === fix.app && f.slug !== fix.slug).slice(0, 4);
  const isSilenced = silenced.includes(fix.slug);
  const pct = fix.steps.length ? Math.round((done.length / fix.steps.length) * 100) : 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${fix.title}\n\n${fix.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nSource: ${fix.source.url}`,
      );
      setCopyState("Copied instructions");
    } catch {
      setCopyState("Copy unavailable. Select the instructions to copy them.");
    }
  };

  return (
    <article className="mx-auto max-w-3xl px-5 pt-10 animate-rise">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          search={filters}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to results
        </Link>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/" search={{ ...emptyFilters, app: fix.app }} className="hover:text-foreground">{fix.app}</Link>
          <span>/</span>
          <span className="max-w-[180px] truncate text-foreground">{deviceLabel[fix.device]}</span>
        </nav>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <AppBadge app={fix.app} size="lg" />
        <StatusBadge status={fix.status} />
        <span>
          <strong className="text-foreground">{fix.app}</strong> · {deviceLabel[fix.device]}
        </span>
        <span className="font-mono text-xs">{fix.estimatedTime}</span>
      </div>

      <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">{fix.title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{fix.summary}</p>

      <section
        className="glass-surface mt-6 rounded-2xl border-l-4 border-l-primary p-5"
        aria-label="Short answer"
      >
        <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          <Zap className="size-3.5" /> Short answer
        </h2>
        <p data-aeo-answer="true" className="mt-2 leading-relaxed">{shortAnswer(fix)}</p>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Compatibility and evidence">
        <div className="glass-surface rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-success">
            <ShieldCheck className="size-4" /> Official documentation linked
          </div>
          <p className="mt-1.5 text-sm">
            {deviceLabel[fix.device]} ·{" "}
            {fix.scope === "os-conditional"
              ? "Availability depends on OS and app settings"
              : "App-specific instructions"}
          </p>
        </div>
        <div className="glass-surface rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground">Documentation review</p>
          <p className="mt-1 font-mono text-sm font-medium">{fix.reviewed}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Hands-on verification, tested version and reviewer are not recorded. Menus may differ by version, region or
            account.
          </p>
        </div>
      </section>

      <section className="glass-surface mt-8 rounded-3xl p-5 sm:p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Instructions</h2>
          <span
            className="rounded-full bg-primary/15 px-3 py-1 font-mono text-xs font-semibold text-primary"
            aria-live="polite"
          >
            {done.length === fix.steps.length ? "All steps checked" : `${done.length} of ${fix.steps.length} checked`}
          </span>
        </div>

        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-black/25" role="progressbar" aria-valuenow={done.length} aria-valuemax={fix.steps.length}>
          <div className="h-full rounded-full bg-hot transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>

        <ol className="space-y-3">
          {fix.steps.map((step, i) => {
            const checked = done.includes(i);
            return (
              <li
                key={i}
                className={`flex items-start gap-4 rounded-2xl border p-4 transition ${
                  checked ? "border-success/35 bg-success/10" : "border-border bg-secondary/40 hover:border-primary/45"
                }`}
              >
                <Checkbox
                  id={`step-${i}`}
                  checked={checked}
                  onCheckedChange={(on) => {
                    const next = on === true ? [...done.filter((n) => n !== i), i] : done.filter((n) => n !== i);
                    setDone(next);
                    if (next.length === fix.steps.length) markSilenced(fix.slug);
                  }}
                  className="mt-1 size-5"
                />
                <label
                  htmlFor={`step-${i}`}
                  className={`min-w-0 cursor-pointer leading-relaxed ${
                    checked ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                >
                  <span className="mr-2 font-mono font-semibold text-primary">{i + 1}.</span>
                  <FormattedStep text={step} />
                </label>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
          <Button
            variant={isSilenced ? "secondary" : "default"}
            onClick={() => toggleSilenced(fix.slug)}
            aria-pressed={isSilenced}
            className="rounded-full"
          >
            {isSilenced ? <CheckCircle2 className="text-success" /> : <VolumeX />}
            {isSilenced ? "Silenced" : "Mark as silenced"}
          </Button>
          <Button variant="outline" onClick={copy} className="rounded-full">
            <Copy />
            Copy instructions
          </Button>
          <Button variant="outline" onClick={() => toggle(fix.slug)} aria-pressed={saved.includes(fix.slug)} className="rounded-full">
            <Bookmark className={saved.includes(fix.slug) ? "fill-primary text-primary" : ""} />
            {saved.includes(fix.slug) ? "Saved" : "Save fix"}
          </Button>
          {done.length > 0 && (
            <Button variant="ghost" onClick={() => setDone([])} className="rounded-full">
              <RotateCcw />
              Reset checklist
            </Button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground" role="status">
          {copyState}
        </p>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="glass-surface rounded-2xl p-5">
          <h2 className="text-lg font-bold">Limitations &amp; recovery</h2>
          {fix.important && <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{fix.important}</p>}
          {fix.alt && fix.alt.length > 0 && (
            <p className="mt-2.5 text-sm text-muted-foreground">
              {Array.isArray(fix.alt) ? fix.alt.join(" · ") : fix.alt}
            </p>
          )}
          <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
            If the setting is missing, check the official source for your version. Do not disable unrelated settings. To
            reverse a toggle change, return to the same setting and restore its previous value.
          </p>
          {fix.status === "unconfirmed" && (
            <p className="mt-3 rounded-xl bg-warning/10 p-2.5 text-xs text-warning">
              No confirmed switch means no supported method is recorded here—not proof that disabling it is impossible.
            </p>
          )}
        </section>

        <section className="glass-surface rounded-2xl p-5">
          <h2 className="text-lg font-bold">Source &amp; evidence</h2>
          <Button asChild variant="link" className="mt-2.5 h-auto whitespace-normal px-0 text-left text-primary">
            <a href={fix.source.url} target="_blank" rel="noopener noreferrer">
              {fix.source.label}
              <ArrowUpRight />
            </a>
          </Button>
          {fix.moreSources?.map((src) => (
            <Button key={src.url} asChild variant="link" className="h-auto whitespace-normal px-0 text-left text-primary">
              <a href={src.url} target="_blank" rel="noopener noreferrer">
                {src.label}
                <ArrowUpRight />
              </a>
            </Button>
          ))}
          <p className="mt-2 text-sm text-muted-foreground">
            {fix.note ?? "Based on the linked official documentation; not independently device-tested."}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Saved fixes stay in this browser and do not sync across devices.
          </p>
        </section>
      </div>

      {FOCUS_BLOCKER_CATEGORIES.has(fix.category) && <OfferSlot id="focus-blocker" context={fix.app} />}
      {DATA_REMOVAL_CATEGORIES.has(fix.category) && <OfferSlot id="data-removal" context={fix.app} />}

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">More {fix.app} fixes</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                to="/fix/$slug"
                params={{ slug: r.slug }}
                search={filters}
                className="spotlight-card rounded-2xl p-4 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <p className="font-semibold">{r.title}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {deviceLabel[r.device]} · {r.estimatedTime}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(() => {
        const od = otherDevices(fix);
        return (
          od.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-bold">The same fix on other devices</h2>
              <div className="glass-surface overflow-x-auto rounded-2xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="p-3.5">Device</th>
                      <th className="p-3.5">Instructions</th>
                      <th className="p-3.5">Result</th>
                      <th className="p-3.5">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border bg-muted/40">
                      <td className="p-3.5 font-medium">{deviceLabel[fix.device]}</td>
                      <td className="p-3.5">This page</td>
                      <td className="p-3.5">{statusLabel[fix.status]}</td>
                      <td className="p-3.5 font-mono text-xs">{fix.estimatedTime}</td>
                    </tr>
                    {od.map((o) => (
                      <tr key={o.slug} className="border-t border-border">
                        <td className="p-3.5 font-medium">{deviceLabel[o.device]}</td>
                        <td className="p-3.5">
                          <Link to="/fix/$slug" params={{ slug: o.slug }} className="text-primary hover:underline">
                            {o.title}
                          </Link>
                        </td>
                        <td className="p-3.5">{statusLabel[o.status]}</td>
                        <td className="p-3.5 font-mono text-xs">{o.estimatedTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )
        );
      })()}

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold">Frequently asked questions</h2>
        <div className="space-y-2.5">
          {fixFaq(fix).map((x, idx) => (
            <details key={x.q} open={idx === 0} className="glass-surface rounded-2xl">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-semibold">
                <span>{x.q}</span>
                <ChevronDown className="faq-chevron size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
              </summary>
              <p className="border-t border-border px-4 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground">
                {x.a}
              </p>
            </details>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: fixFaq(fix).map((x) => ({
                "@type": "Question",
                name: x.q,
                acceptedAnswer: { "@type": "Answer", text: x.a },
              })),
            }).replace(/</g, "\\u003c"),
          }}
        />
      </section>

      {(() => {
        const sc = sameCategory(fix);
        return (
          sc.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-bold">Similar {fix.category.toLowerCase()} fixes for other apps</h2>
              <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {sc.map((r) => (
                  <li key={r.slug}>
                    <Link
                      to="/fix/$slug"
                      params={{ slug: r.slug }}
                      className="glass-surface flex items-center gap-3 rounded-xl p-3 text-sm transition hover:border-primary"
                    >
                      <AppBadge app={r.app} />
                      <div className="min-w-0">
                        <span className="block truncate font-medium">{r.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          {r.app} · {deviceLabel[r.device]} · {statusLabel[r.status]}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        );
      })()}
    </article>
  );
}
