import { createFileRoute, Link, notFound, stripSearchParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Bookmark, Check, Copy, ShieldCheck, RotateCcw } from "lucide-react";
import { deviceLabel, emptyFilters, fixes, type Fix, type FixFilters } from "@/lib/fixes";
import { filterSearch, hasActiveFilters } from "@/lib/filter-search";
import { fixDocumentTitle, fixMetaDescription, shareMeta } from "@/lib/page-meta";
import { relatedFixes } from "@/lib/related-fixes";
import { absoluteUrl, robotsDirective } from "@/lib/site";
import { fixStructuredData } from "@/lib/structured-data";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useSaved } from "@/lib/saved";
export const Route = createFileRoute("/fix/$slug")({
  validateSearch: filterSearch,
  search: { middlewares: [stripSearchParams(emptyFilters)] },
  loader: ({ params }) => { const fix = fixes.find((f) => f.slug === params.slug); if (!fix) throw notFound(); return { fix }; },
  head: ({ loaderData, match }) => {
    const fix = loaderData?.fix;
    const url = fix ? absoluteUrl(`/fix/${fix.slug}`) : absoluteUrl("/");
    const title = fix ? fixDocumentTitle(fix.title) : "That fix doesn't exist.";
    const description = fix ? fixMetaDescription(fix) : "That fix doesn't exist.";
    return { meta: [
      { title },
      { name: "description", content: description },
      ...(fix ? [{ property: "og:url", content: url }, { property: "og:type", content: "article" }] : []),
      ...shareMeta(title, description),
      { name: "robots", content: robotsDirective(Boolean(fix) && !hasActiveFilters(match.search)) },
    ], links: fix ? [{ rel: "canonical", href: url }] : [], scripts: fix ? [{ type: "application/ld+json", children: JSON.stringify(fixStructuredData(fix)) }] : [] };
  },
  notFoundComponent: () => <div className="mx-auto max-w-xl px-5 py-32 text-center"><h1 className="text-4xl font-bold">That fix doesn't exist.</h1><Link to="/" className="mt-6 inline-block text-primary">← Back to all fixes</Link></div>,
  component: FixPage,
});
function FixPage() { const { fix } = Route.useLoaderData(); return <FixContent key={fix.slug} fix={fix} />; }
function FixContent({ fix }: { fix: (typeof fixes)[number] }) {
  const filters = Route.useSearch();
  const [done, setDone] = useState<number[]>([]);
  const [copyState, setCopyState] = useState("");
  const { saved, toggle } = useSaved();
  const copy = async () => { try { await navigator.clipboard.writeText(`${fix.title}\n\n${fix.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nSource: ${fix.source.url}`); setCopyState("Copied instructions"); } catch { setCopyState("Copy unavailable. Select the instructions to copy them."); } };
  return <article className="mx-auto max-w-3xl px-5 pt-10 animate-rise">
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <li><Link to="/" className="hover:text-foreground">Fixes</Link></li>
        <li aria-hidden="true">/</li>
        <li><Link to="/" search={{ ...emptyFilters, app: fix.app }} className="hover:text-foreground">{fix.app}</Link></li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-foreground">{fix.title}</li>
      </ol>
    </nav>
    <Link to="/" search={filters} className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to results</Link>
    <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-muted-foreground"><StatusBadge status={fix.status} /><span>{fix.app} · {deviceLabel[fix.device]}</span><span>{fix.estimatedTime}</span></div>
    <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">{fix.title}</h1>
    <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{fix.summary}</p>
    <section className="mt-7 border-y border-border py-5" aria-label="Compatibility and evidence"><div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="size-4 text-success" />Official documentation linked</div><dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">Compatibility</dt><dd className="mt-1">{deviceLabel[fix.device]} · {fix.scope === "os-conditional" ? "Availability depends on OS and app settings" : "App-specific instructions"}</dd></div><div><dt className="text-muted-foreground">Documentation review</dt><dd className="mt-1">{fix.reviewed}</dd></div></dl><p className="mt-3 text-xs leading-relaxed text-muted-foreground">Hands-on verification, tested version and reviewer are not recorded. Menus may differ by version, region or account.</p></section>
    <section className="mt-8"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">Instructions</h2><span className="text-sm text-muted-foreground" aria-live="polite">{done.length === fix.steps.length ? "All steps checked" : `${done.length} of ${fix.steps.length} checked`}</span></div>
    <progress className="mb-5 h-1.5 w-full accent-primary" max={fix.steps.length} value={done.length} aria-label="Instruction progress" />
    <ol className="divide-y divide-border">{fix.steps.map((step, i) => <li key={i} className="flex items-start gap-4 py-5"><Checkbox id={`step-${i}`} checked={done.includes(i)} onCheckedChange={(on) => setDone((current) => on === true ? [...current.filter((n) => n !== i), i] : current.filter((n) => n !== i))} className="mt-1 size-5" /><label htmlFor={`step-${i}`} className={`min-w-0 cursor-pointer leading-relaxed ${done.includes(i) ? "text-muted-foreground" : "text-foreground"}`}><span className="mr-2 font-semibold text-primary">{i + 1}.</span>{step}</label></li>)}</ol>
    <div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" onClick={copy}><Copy />Copy instructions</Button><Button variant="outline" onClick={() => toggle(fix.slug)} aria-pressed={saved.includes(fix.slug)}><Bookmark className={saved.includes(fix.slug) ? "fill-primary text-primary" : ""} />{saved.includes(fix.slug) ? "Saved" : "Save fix"}</Button>{done.length > 0 && <Button variant="ghost" onClick={() => setDone([])}><RotateCcw />Reset checklist</Button>}</div><p className="mt-2 text-xs text-muted-foreground" role="status">{copyState}</p></section>
    <section className="mt-8 border-t border-border pt-6"><h2 className="text-xl font-bold">Limitations & recovery</h2>{fix.important && <p className="mt-3 leading-relaxed text-muted-foreground">{fix.important}</p>}{fix.alt && fix.alt.length > 0 && <p className="mt-3 text-sm text-muted-foreground">{Array.isArray(fix.alt) ? fix.alt.join(" · ") : fix.alt}</p>}<p className="mt-3 text-sm text-muted-foreground">If the setting is missing, check the official source for your version. Do not disable unrelated settings. To reverse a toggle change, return to the same setting and restore its previous value.</p>{fix.status === "unconfirmed" && <p className="mt-3 text-sm text-warning">No confirmed switch means no supported method is recorded here—not proof that disabling it is impossible.</p>}</section>
    <section className="mt-8 border-t border-border pt-6"><h2 className="text-xl font-bold">Source & evidence</h2><Button asChild variant="link" className="mt-3 h-auto whitespace-normal px-0 text-left"><a href={fix.source.url} target="_blank" rel="noopener noreferrer">{fix.source.label}<ArrowUpRight /></a></Button><p className="mt-2 text-sm text-muted-foreground">{fix.note ?? "Based on the linked official documentation; not independently device-tested."}</p><p className="mt-3 text-xs text-muted-foreground">Saved fixes stay in this browser and do not sync across devices.</p></section>
    <RelatedFixes fix={fix} filters={filters} />
  </article>;
}

function FixLinkCard({ fix, filters }: { fix: Fix; filters: FixFilters }) {
  return <Link to="/fix/$slug" params={{ slug: fix.slug }} search={filters} className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring"><p className="font-semibold">{fix.title}</p><p className="mt-2 text-xs text-muted-foreground">{deviceLabel[fix.device]} · {fix.estimatedTime}</p></Link>;
}

function RelatedFixes({ fix, filters }: { fix: Fix; filters: FixFilters }) {
  const { counterparts, sameCategory, moreFromApp } = relatedFixes(fix);
  return <>
    {counterparts.length > 0 && <section className="mt-12"><h2 className="mb-4 text-xl font-bold">Same task on another device</h2><div className="grid gap-3 sm:grid-cols-2">{counterparts.map((related) => <FixLinkCard key={related.slug} fix={related} filters={filters} />)}</div></section>}
    {sameCategory.length > 0 && <section className="mt-12"><h2 className="mb-4 text-xl font-bold">More {fix.category} fixes for {fix.app}</h2><div className="grid gap-3 sm:grid-cols-2">{sameCategory.map((related) => <FixLinkCard key={related.slug} fix={related} filters={filters} />)}</div></section>}
    {moreFromApp.length > 0 && <section className="mt-12"><h2 className="mb-4 text-xl font-bold">More {fix.app} fixes</h2><div className="grid gap-3 sm:grid-cols-2">{moreFromApp.map((related) => <FixLinkCard key={related.slug} fix={related} filters={filters} />)}</div></section>}
  </>;
}
