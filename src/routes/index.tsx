import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowUpRight, Bookmark, Search, X, Smartphone, Monitor, ShieldCheck } from "lucide-react";
import { apps, categories, deviceLabel, fixes, filterFixes, emptyFilters, statusLabel } from "@/lib/fixes";
import { filterSearch, hasActiveFilters } from "@/lib/filter-search";
import { HOME_DESCRIPTION, HOME_TITLE, shareMeta } from "@/lib/page-meta";
import { absoluteUrl, robotsDirective } from "@/lib/site";
import { homeStructuredData } from "@/lib/structured-data";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useSaved } from "@/lib/saved";

export const Route = createFileRoute("/")({
  validateSearch: filterSearch,
  search: { middlewares: [stripSearchParams(emptyFilters)] },
  head: ({ match }) => {
    const url = absoluteUrl("/");
    return { meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESCRIPTION },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      ...shareMeta(HOME_TITLE, HOME_DESCRIPTION),
      { name: "robots", content: robotsDirective(!hasActiveFilters(match.search)) },
    ], links: [{ rel: "canonical", href: url }], scripts: [{ type: "application/ld+json", children: JSON.stringify(homeStructuredData()) }] };
  },
  component: Index,
});
const examples = ["YouTube autoplay", "WhatsApp groups", "iPhone summaries", "Chrome popups"];
function Index() {
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();
  const { saved, toggle } = useSaved();
  const update = (values: Partial<typeof filters>, replace = false) => navigate({ search: (prev) => ({ ...prev, ...values }), replace, resetScroll: false });
  const results = useMemo(() => filterFixes(fixes, filters, saved), [filters, saved]);
  const filtered = hasActiveFilters(filters);
  return <div className="mx-auto max-w-6xl px-5">
    <section className="border-b border-border py-12 sm:py-16 animate-rise">
      <div className="mb-5 flex items-center gap-2 text-xs font-medium text-muted-foreground"><ShieldCheck className="size-4 text-success" />{fixes.length} source-backed fixes · {apps.length} apps</div>
      <h1 className="text-5xl font-extrabold leading-tight sm:text-6xl">STOP THAT<span className="text-primary">!</span></h1>
      <p className="mt-3 text-xl text-foreground">Make your apps less annoying.</p>
      <p className="mt-2 max-w-2xl text-muted-foreground">Notifications, autoplay, pop-ups and unwanted AI features. Exact instructions, official sources, and honest answers when no switch is confirmed.</p>
      <div className="mt-7 flex max-w-3xl items-center gap-3 rounded-lg border border-input bg-card px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <input value={filters.q} onChange={(e) => update({ q: e.target.value }, true)} placeholder="Search an app or annoyance…" aria-label="Search fixes" className="min-w-0 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground" />
        {filters.q && <Button variant="ghost" size="icon" aria-label="Clear search" title="Clear search" onClick={() => update({ q: "" })}><X /></Button>}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">{examples.map((q) => <Button variant="ghost" size="sm" key={q} onClick={() => update({ q })} className="text-muted-foreground">{q}<ArrowUpRight /></Button>)}</div>
    </section>
    <section aria-label="Filter fixes" className="space-y-4 border-b border-border py-6">
      <div className="flex flex-wrap items-end gap-3">
        {([
          ["app", "App", apps.map((a) => [a, a])],
          ["category", "Type", categories.map((c) => [c, c])],
          ["platform", "Platform", ["iphone", "android", "desktop"].map((d) => [d, deviceLabel[d]])],
        ] as const).map(([key, label, options]) => <label key={key} className="flex min-w-36 flex-1 flex-col gap-1.5 text-xs font-medium text-muted-foreground"><span>{label}</span><select aria-label={label} value={filters[key]} onChange={(e) => update({ [key]: e.target.value })} className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">All {label === "Type" ? "types" : label === "Platform" ? "platforms" : "apps"}</option>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>)}
        <Button variant={filters.saved ? "default" : "outline"} aria-pressed={filters.saved} onClick={() => update({ saved: !filters.saved })} className="h-10"><Bookmark />Saved ({saved.length})</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-xs text-muted-foreground">Outcome</span><Button size="sm" variant={!filters.outcome ? "secondary" : "ghost"} aria-pressed={!filters.outcome} onClick={() => update({ outcome: "" })}>All outcomes</Button>{Object.entries(statusLabel).map(([value, label]) => <Button key={value} size="sm" variant={filters.outcome === value ? "secondary" : "ghost"} aria-pressed={filters.outcome === value} onClick={() => update({ outcome: filters.outcome === value ? "" : value })}>{label}</Button>)}{filtered && <Button variant="link" size="sm" onClick={() => navigate({ search: emptyFilters, resetScroll: false })}><X />Reset filters</Button>}</div>
    </section>
    <div className="my-6 flex flex-wrap justify-between gap-2"><p aria-live="polite" className="text-sm text-muted-foreground">{results.length} {results.length === 1 ? "fix" : "fixes"}</p>{filters.saved && <p className="text-xs text-muted-foreground">Saved in this browser only; not synced across devices.</p>}</div>
    {!results.length ? <section className="py-12 text-center"><Search className="mx-auto mb-4 size-8 text-muted-foreground" /><h2 className="text-2xl font-bold">No matching fixes.</h2><p className="mt-2 text-muted-foreground">Try an app name or a shorter phrase, or remove a filter.</p><Button className="mt-5" variant="outline" onClick={() => navigate({ search: emptyFilters })}>Clear all filters</Button></section> :
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{results.map((f) => <article key={f.slug} className="group relative flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/60">
      <div className="mb-3 flex items-center justify-between gap-2 text-xs text-muted-foreground"><span className="flex items-center gap-2">{f.device === "desktop" ? <Monitor className="size-4" /> : <Smartphone className="size-4" />}<span className="font-semibold text-foreground">{f.app}</span> · {deviceLabel[f.device]}</span><Button variant="ghost" size="icon" aria-label={saved.includes(f.slug) ? `Unsave ${f.title}` : `Save ${f.title}`} title={saved.includes(f.slug) ? "Unsave fix" : "Save fix"} aria-pressed={saved.includes(f.slug)} onClick={() => toggle(f.slug)} className="relative z-10 size-8"><Bookmark className={saved.includes(f.slug) ? "fill-primary text-primary" : "text-muted-foreground"} /></Button></div>
      <Link to="/fix/$slug" params={{ slug: f.slug }} search={filters} className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring"><h2 className="text-lg font-bold leading-snug transition-colors group-hover:text-primary">{f.title}</h2></Link>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.summary}</p>
      <div className="mt-auto pt-5"><StatusBadge status={f.status} /><p className="mt-3 text-xs text-muted-foreground">Official source · reviewed {f.reviewed}</p><div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs"><span className="text-muted-foreground">{f.estimatedTime}</span><span className="flex items-center gap-1 text-primary">View instructions <ArrowUpRight className="size-3.5" /></span></div></div>
    </article>)}</div>}
  </div>;
}
