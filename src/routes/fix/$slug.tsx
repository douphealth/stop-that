import { createFileRoute, Link, notFound, stripSearchParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Bookmark, Check, Copy, ShieldCheck, RotateCcw } from "lucide-react";
import { deviceLabel, emptyFilters, fixes } from "@/lib/fixes";
import { filterSearch } from "@/lib/filter-search";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useSaved } from "@/lib/saved";
import { fixFaq, otherDevices, sameCategory, shortAnswer } from "@/lib/fix-content";
import { statusLabel } from "@/lib/fixes";
export const Route = createFileRoute("/fix/$slug")({
  validateSearch: filterSearch,
  search: { middlewares: [stripSearchParams(emptyFilters)] },
  loader: ({ params }) => { const fix = fixes.find((f) => f.slug === params.slug); if (!fix) throw notFound(); return { fix }; },
  head: ({ loaderData }) => ({ meta: [
    { title: loaderData ? `${loaderData.fix.title} | STOP THAT!` : "Fix unavailable | STOP THAT!" },
    { name: "description", content: loaderData?.fix.summary ?? "This fix is unavailable." },
    { property: "og:title", content: loaderData?.fix.title ?? "Fix unavailable | STOP THAT!" },
    { property: "og:description", content: loaderData?.fix.summary ?? "Return to the STOP THAT! directory." },
    { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary_large_image" },
  ], scripts: loaderData ? [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "HowTo", name: loaderData.fix.title, description: loaderData.fix.summary, step: loaderData.fix.steps.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })) }) }] : [] }),
  notFoundComponent: () => <div className="mx-auto max-w-xl px-5 py-32 text-center"><h1 className="text-4xl font-bold">That fix doesn't exist.</h1><Link to="/" className="mt-6 inline-block text-primary">← Back to all fixes</Link></div>,
  component: FixPage,
});
function FixPage() { const { fix } = Route.useLoaderData(); return <FixContent key={fix.slug} fix={fix} />; }
function FixContent({ fix }: { fix: (typeof fixes)[number] }) {
  const filters = Route.useSearch();
  const [done, setDone] = useState<number[]>([]);
  const [copyState, setCopyState] = useState("");
  const { saved, toggle } = useSaved();
  const related = fixes.filter((f) => f.app === fix.app && f.slug !== fix.slug).slice(0, 4);
  const copy = async () => { try { await navigator.clipboard.writeText(`${fix.title}\n\n${fix.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nSource: ${fix.source.url}`); setCopyState("Copied instructions"); } catch { setCopyState("Copy unavailable. Select the instructions to copy them."); } };
  return <article className="mx-auto max-w-3xl px-5 pt-10 animate-rise">
    <Link to="/" search={filters} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to results</Link>
    <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-muted-foreground"><StatusBadge status={fix.status} /><span>{fix.app} · {deviceLabel[fix.device]}</span><span>{fix.estimatedTime}</span></div>
    <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">{fix.title}</h1>
    <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{fix.summary}</p>
    <section className="mt-6 rounded-lg border border-border bg-card p-5" aria-label="Short answer"><h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Short answer</h2><p className="mt-2 leading-relaxed">{shortAnswer(fix)}</p></section>
    <section className="mt-7 border-y border-border py-5" aria-label="Compatibility and evidence"><div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="size-4 text-success" />Official documentation linked</div><dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">Compatibility</dt><dd className="mt-1">{deviceLabel[fix.device]} · {fix.scope === "os-conditional" ? "Availability depends on OS and app settings" : "App-specific instructions"}</dd></div><div><dt className="text-muted-foreground">Documentation review</dt><dd className="mt-1">{fix.reviewed}</dd></div></dl><p className="mt-3 text-xs leading-relaxed text-muted-foreground">Hands-on verification, tested version and reviewer are not recorded. Menus may differ by version, region or account.</p></section>
    <section className="mt-8"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">Instructions</h2><span className="text-sm text-muted-foreground" aria-live="polite">{done.length === fix.steps.length ? "All steps checked" : `${done.length} of ${fix.steps.length} checked`}</span></div>
    <progress className="mb-5 h-1.5 w-full accent-primary" max={fix.steps.length} value={done.length} aria-label="Instruction progress" />
    <ol className="divide-y divide-border">{fix.steps.map((step, i) => <li key={i} className="flex items-start gap-4 py-5"><Checkbox id={`step-${i}`} checked={done.includes(i)} onCheckedChange={(on) => setDone((current) => on === true ? [...current.filter((n) => n !== i), i] : current.filter((n) => n !== i))} className="mt-1 size-5" /><label htmlFor={`step-${i}`} className={`min-w-0 cursor-pointer leading-relaxed ${done.includes(i) ? "text-muted-foreground" : "text-foreground"}`}><span className="mr-2 font-semibold text-primary">{i + 1}.</span>{step}</label></li>)}</ol>
    <div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" onClick={copy}><Copy />Copy instructions</Button><Button variant="outline" onClick={() => toggle(fix.slug)} aria-pressed={saved.includes(fix.slug)}><Bookmark className={saved.includes(fix.slug) ? "fill-primary text-primary" : ""} />{saved.includes(fix.slug) ? "Saved" : "Save fix"}</Button>{done.length > 0 && <Button variant="ghost" onClick={() => setDone([])}><RotateCcw />Reset checklist</Button>}</div><p className="mt-2 text-xs text-muted-foreground" role="status">{copyState}</p></section>
    <section className="mt-8 border-t border-border pt-6"><h2 className="text-xl font-bold">Limitations & recovery</h2>{fix.important && <p className="mt-3 leading-relaxed text-muted-foreground">{fix.important}</p>}{fix.alt && fix.alt.length > 0 && <p className="mt-3 text-sm text-muted-foreground">{Array.isArray(fix.alt) ? fix.alt.join(" · ") : fix.alt}</p>}<p className="mt-3 text-sm text-muted-foreground">If the setting is missing, check the official source for your version. Do not disable unrelated settings. To reverse a toggle change, return to the same setting and restore its previous value.</p>{fix.status === "unconfirmed" && <p className="mt-3 text-sm text-warning">No confirmed switch means no supported method is recorded here—not proof that disabling it is impossible.</p>}</section>
    <section className="mt-8 border-t border-border pt-6"><h2 className="text-xl font-bold">Source & evidence</h2><Button asChild variant="link" className="mt-3 h-auto whitespace-normal px-0 text-left"><a href={fix.source.url} target="_blank" rel="noopener noreferrer">{fix.source.label}<ArrowUpRight /></a></Button><p className="mt-2 text-sm text-muted-foreground">{fix.note ?? "Based on the linked official documentation; not independently device-tested."}</p><p className="mt-3 text-xs text-muted-foreground">Saved fixes stay in this browser and do not sync across devices.</p></section>
    {related.length > 0 && <section className="mt-12"><h2 className="mb-4 text-xl font-bold">More {fix.app} fixes</h2><div className="grid gap-3 sm:grid-cols-2">{related.map((r) => <Link key={r.slug} to="/fix/$slug" params={{ slug: r.slug }} search={filters} className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring"><p className="font-semibold">{r.title}</p><p className="mt-2 text-xs text-muted-foreground">{deviceLabel[r.device]} · {r.estimatedTime}</p></Link>)}</div></section>}
    {(() => { const od = otherDevices(fix); return od.length > 0 && <section className="mt-12"><h2 className="mb-4 text-xl font-bold">The same fix on other devices</h2><div className="overflow-x-auto rounded-lg border border-border"><table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th className="p-3">Device</th><th className="p-3">Instructions</th><th className="p-3">Result</th><th className="p-3">Time</th></tr></thead><tbody><tr className="border-t border-border bg-muted/40"><td className="p-3 font-medium">{deviceLabel[fix.device]}</td><td className="p-3">This page</td><td className="p-3">{statusLabel[fix.status]}</td><td className="p-3">{fix.estimatedTime}</td></tr>{od.map((o) => <tr key={o.slug} className="border-t border-border"><td className="p-3 font-medium">{deviceLabel[o.device]}</td><td className="p-3"><Link to="/fix/$slug" params={{ slug: o.slug }} className="text-primary hover:underline">{o.title}</Link></td><td className="p-3">{statusLabel[o.status]}</td><td className="p-3">{o.estimatedTime}</td></tr>)}</tbody></table></div></section>; })()}
    <section className="mt-12"><h2 className="mb-4 text-xl font-bold">Frequently asked questions</h2><div className="divide-y divide-border rounded-lg border border-border">{fixFaq(fix).map((x) => <div key={x.q} className="p-5"><h3 className="font-semibold">{x.q}</h3><p className="mt-2 leading-relaxed text-muted-foreground">{x.a}</p></div>)}</div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: fixFaq(fix).map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) }).replace(/</g, "\\u003c") }} /></section>
    {(() => { const sc = sameCategory(fix); return sc.length > 0 && <section className="mt-12"><h2 className="mb-4 text-xl font-bold">Similar {fix.category.toLowerCase()} fixes for other apps</h2><ul className="grid gap-2 sm:grid-cols-2">{sc.map((r) => <li key={r.slug}><Link to="/fix/$slug" params={{ slug: r.slug }} className="block rounded-lg border border-border p-3 text-sm hover:border-primary"><span className="font-medium">{r.title}</span><span className="block text-xs text-muted-foreground">{r.app} · {deviceLabel[r.device]} · {statusLabel[r.status]}</span></Link></li>)}</ul></section>; })()}
  </article>;
}
