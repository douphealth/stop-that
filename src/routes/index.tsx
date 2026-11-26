import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Ban,
  BellOff,
  Bookmark,
  Check,
  Eye,
  LayoutGrid,
  List,
  Monitor,
  PlayCircle,
  RotateCcw,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from "lucide-react";
import { apps, categories, deviceLabel, fixes, filterFixes, emptyFilters, type Fix } from "@/lib/fixes";
import { filterSearch } from "@/lib/filter-search";
import { StatusBadge } from "@/components/StatusBadge";
import { AppBadge } from "@/components/AppBadge";
import { HeroNoiseSimulator } from "@/components/HeroNoiseSimulator";
import { QuietPlanWizard } from "@/components/QuietPlanWizard";
import { AppMarquee } from "@/components/AppMarquee";
import { AeoDirectorySection } from "@/components/AeoDirectorySection";
import { Button } from "@/components/ui/button";
import { useSaved } from "@/lib/saved";
import { useSilenced } from "@/lib/app-theme";

export const Route = createFileRoute("/")({
  validateSearch: filterSearch,
  // Keep "/" clean: default filters are stripped so crawlers get a 200 at the canonical URL, not a 307 to "?q=&app=...".
  search: { middlewares: [stripSearchParams(emptyFilters)] },
  head: () => ({
    meta: [
      { title: "STOP THAT! — Source-backed fixes for annoying apps" },
      {
        name: "description",
        content:
          "Find official-source-backed instructions for notifications, pop-ups, autoplay and AI features, with honest limitations.",
      },
      { property: "og:title", content: "STOP THAT! — Make your apps less annoying" },
      {
        property: "og:description",
        content: `Search ${fixes.length} fixes across ${apps.length} apps. Clear steps, official sources, honest outcomes.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "STOP THAT! — Source-backed fixes for annoying apps",
          url: "https://stopthat.shop/",
          description: `Search ${fixes.length} official-source-backed fixes across ${apps.length} apps.`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: fixes.length,
            itemListElement: fixes.slice(0, 20).map((f, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: f.title,
              url: `https://stopthat.shop/fix/${f.slug}`,
            })),
          },
        }),
      },
    ],
  }),
  component: Index,
});

const examples = ["YouTube autoplay", "WhatsApp groups", "iPhone summaries", "Chrome popups", "Uber Eats"];

function CategoryIcon({ name }: { name: string }) {
  if (name === "Notifications") return <BellOff className="size-3.5" />;
  if (name === "Privacy") return <ShieldCheck className="size-3.5" />;
  if (name === "Autoplay") return <PlayCircle className="size-3.5" />;
  if (name === "AI features") return <Sparkles className="size-3.5" />;
  return <Ban className="size-3.5" />;
}

function Index() {
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();
  const { saved, toggle } = useSaved();
  const { silenced } = useSilenced();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [peekFix, setPeekFix] = useState<Fix | null>(null);

  const update = (values: Partial<typeof filters>, replace = false) =>
    navigate({ search: (prev) => ({ ...prev, ...values }), replace, resetScroll: false });

  const results = useMemo(() => filterFixes(fixes, filters, saved), [filters, saved]);
  const appCounts = useMemo(
    () => Object.fromEntries(apps.map((a) => [a, fixes.filter((f) => f.app === a).length])),
    [],
  );
  const disableCount = useMemo(() => fixes.filter((f) => f.status === "disable").length, []);
  const reduceCount = useMemo(() => fixes.filter((f) => f.status === "reduce").length, []);
  const unconfCount = useMemo(() => fixes.filter((f) => f.status === "unconfirmed").length, []);

  const filtered = Boolean(
    filters.q || filters.app || filters.category || filters.platform || filters.outcome || filters.saved,
  );

  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* 2-Column Interactive Hero */}
      <section className="grid grid-cols-1 items-center gap-8 border-b border-border py-10 lg:grid-cols-12 lg:py-14 animate-rise">
        <div className="min-w-0 lg:col-span-7">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
              <span className="size-2 rounded-full bg-success animate-pulse" />
              <span>
                {fixes.length} source-backed fixes · {apps.length} apps
              </span>
            </div>
            <button
              type="button"
              onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-hot px-3.5 py-1 text-xs font-semibold text-primary-foreground shadow-md transition hover:scale-[1.02] hover:opacity-95"
            >
              <Sparkles className="size-3.5" /> Build My Quiet Plan
            </button>
          </div>

          <h1 className="text-5xl font-extrabold leading-[1.03] sm:text-6xl">
            STOP THAT<span className="text-hot">!</span>
          </h1>
          <p className="mt-3 font-display text-xl font-semibold text-foreground sm:text-2xl">
            Make your apps less annoying.
          </p>
          <p className="mt-2.5 max-w-xl text-muted-foreground">
            Notifications, autoplay, pop-ups and unwanted AI features. Exact instructions, official sources, and honest
            answers when no switch is confirmed.
          </p>

          <div className="beam-border mt-6 flex max-w-3xl items-center gap-3 rounded-2xl border border-input bg-card/85 px-4 py-3 shadow-lg backdrop-blur-xl transition focus-within:ring-2 focus-within:ring-ring/40">
            <Search className="size-5 shrink-0 text-primary" />
            <input
              value={filters.q}
              onChange={(e) => update({ q: e.target.value }, true)}
              placeholder="Search an app or annoyance…"
              aria-label="Search fixes"
              className="w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            {filters.q ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Clear search"
                title="Clear search"
                onClick={() => update({ q: "" })}
              >
                <X />
              </Button>
            ) : (
              <kbd className="hidden rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline-block">
                /
              </kbd>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-muted-foreground">Try:</span>
            {examples.map((q) => (
              <button
                type="button"
                key={q}
                onClick={() => update({ q })}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card/70 px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
              >
                {q}
                <ArrowUpRight className="size-3 opacity-60" />
              </button>
            ))}
          </div>

          {/* Interactive Outcome Breakdown Bar */}
          <div className="mt-6 rounded-2xl border border-border bg-card/70 p-3.5 backdrop-blur-md">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span className="font-medium">Catalog honesty breakdown <span className="hidden sm:inline">(click to filter)</span></span>
              <span className="shrink-0 font-mono text-[11px]">{fixes.length} entries</span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-black/25">
              <button
                type="button"
                onClick={() => update({ outcome: filters.outcome === "disable" ? "" : "disable" })}
                style={{ width: `${(disableCount / fixes.length) * 100}%` }}
                className={`bg-success transition-opacity hover:opacity-100 ${
                  filters.outcome && filters.outcome !== "disable" ? "opacity-30" : "opacity-90"
                }`}
                title={`Can disable (${disableCount})`}
                aria-label={`Filter Can disable (${disableCount})`}
              />
              <button
                type="button"
                onClick={() => update({ outcome: filters.outcome === "reduce" ? "" : "reduce" })}
                style={{ width: `${(reduceCount / fixes.length) * 100}%` }}
                className={`bg-warning transition-opacity hover:opacity-100 ${
                  filters.outcome && filters.outcome !== "reduce" ? "opacity-30" : "opacity-90"
                }`}
                title={`Can reduce (${reduceCount})`}
                aria-label={`Filter Can reduce (${reduceCount})`}
              />
              <button
                type="button"
                onClick={() => update({ outcome: filters.outcome === "unconfirmed" ? "" : "unconfirmed" })}
                style={{ width: `${(unconfCount / fixes.length) * 100}%` }}
                className={`bg-muted-foreground/60 transition-opacity hover:opacity-100 ${
                  filters.outcome && filters.outcome !== "unconfirmed" ? "opacity-30" : "opacity-90"
                }`}
                title={`No confirmed switch (${unconfCount})`}
                aria-label={`Filter No confirmed switch (${unconfCount})`}
              />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-3 text-xs">
              {([
                ["disable", `Can disable (${disableCount})`, "bg-success", "text-success"],
                ["reduce", `Can reduce (${reduceCount})`, "bg-warning", "text-warning"],
                ["unconfirmed", `No confirmed switch (${unconfCount})`, "bg-muted-foreground", "text-foreground"],
              ] as const).map(([val, label, dotCls, activeCls]) => (
                <button
                  key={val}
                  type="button"
                  aria-pressed={filters.outcome === val}
                  onClick={() => update({ outcome: filters.outcome === val ? "" : val })}
                  className={`inline-flex items-center gap-1.5 transition hover:text-foreground ${
                    filters.outcome === val ? `font-bold underline underline-offset-4 ${activeCls}` : "text-muted-foreground"
                  }`}
                >
                  <span className={`size-2 rounded-full ${dotCls}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-5">
          <HeroNoiseSimulator filters={filters} />
        </div>
      </section>

      {/* Infinite Pause-on-Hover App Marquee */}
      <div className="border-b border-border py-2">
        <AppMarquee activeApp={filters.app} onSelect={(app) => update({ app })} />
      </div>

      {/* Interactive Filter Studio */}
      <section aria-label="Filter fixes" className="space-y-4 border-b border-border py-6">
        <div className="dock-scroll flex items-center gap-2 overflow-x-auto pb-1.5">
          <button
            type="button"
            onClick={() => update({ app: "" })}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              !filters.app
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card/70 text-muted-foreground hover:text-foreground"
            }`}
          >
            All Apps ({fixes.length})
          </button>
          {apps.map((app) => (
            <button
              key={app}
              type="button"
              onClick={() => update({ app: filters.app === app ? "" : app })}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border py-1 pl-1.5 pr-3 text-xs font-medium transition ${
                filters.app === app
                  ? "border-primary bg-primary/15 text-foreground ring-1 ring-primary/40"
                  : "border-border bg-card/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              <AppBadge app={app} />
              <span>{app}</span>
              <span className="font-mono text-[10px] opacity-65">{appCounts[app]}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => update({ category: "" })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                !filters.category
                  ? "bg-foreground font-semibold text-background"
                  : "border border-border bg-card/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              All types
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => update({ category: filters.category === cat ? "" : cat })}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  filters.category === cat
                    ? "bg-foreground font-semibold text-background"
                    : "border border-border bg-card/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                <CategoryIcon name={cat} />
                <span>{cat}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-border bg-card/70 p-0.5 text-xs">
              {([
                ["", "All"],
                ["iphone", "iPhone"],
                ["android", "Android"],
                ["desktop", "Desktop"],
              ] as const).map(([val, lbl]) => (
                <button
                  key={val || "all"}
                  type="button"
                  aria-pressed={filters.platform === val}
                  onClick={() => update({ platform: val })}
                  className={`rounded-full px-2.5 py-1 font-medium transition ${
                    filters.platform === val
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>

            <Button
              variant={filters.saved ? "default" : "outline"}
              size="sm"
              aria-pressed={filters.saved}
              onClick={() => update({ saved: !filters.saved })}
              className="rounded-full"
            >
              <Bookmark className={filters.saved ? "fill-current" : ""} />
              Saved ({saved.length})
            </Button>

            <div className="inline-flex rounded-full border border-border bg-card/70 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                className={`rounded-full p-1.5 transition ${
                  viewMode === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="Compact list view"
                aria-pressed={viewMode === "list"}
                className={`rounded-full p-1.5 transition ${
                  viewMode === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="my-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <p aria-live="polite" className="text-sm text-muted-foreground">
            Showing <span className="font-mono font-bold text-foreground">{results.length}</span>{" "}
            {results.length === 1 ? "fix" : "fixes"}
          </p>
          {filtered && (
            <button
              type="button"
              onClick={() => navigate({ search: emptyFilters, resetScroll: false })}
              className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary transition hover:bg-primary/25"
            >
              <RotateCcw className="size-3" /> Reset filters
            </button>
          )}
        </div>
        {filters.saved && (
          <p className="text-xs text-muted-foreground">Saved in this browser only; not synced across devices.</p>
        )}
      </div>

      {!results.length ? (
        <section className="glass-surface my-8 rounded-3xl px-6 py-14 text-center">
          <Search className="mx-auto mb-4 size-8 text-primary" />
          <h2 className="text-2xl font-bold">No matching fixes.</h2>
          <p className="mt-2 text-muted-foreground">Try an app name or a shorter phrase, or remove a filter.</p>
          <Button className="mt-5 rounded-full" variant="outline" onClick={() => navigate({ search: emptyFilters })}>
            Clear all filters
          </Button>
        </section>
      ) : viewMode === "list" ? (
        <div className="space-y-2.5">
          {results.map((f) => {
            const isSilenced = silenced.includes(f.slug);
            return (
              <article
                key={f.slug}
                className={`spotlight-card group flex flex-wrap items-center justify-between gap-4 rounded-2xl px-4 py-3.5 ${
                  isSilenced ? "ring-1 ring-success/40" : ""
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <AppBadge app={f.app} />
                  <div className="min-w-0">
                    <Link
                      to="/fix/$slug"
                      params={{ slug: f.slug }}
                      search={filters}
                      className="font-display text-base font-bold text-foreground transition-colors group-hover:text-primary"
                    >
                      {f.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {f.app} · {deviceLabel[f.device]} · {f.category} · {f.estimatedTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={f.status} />
                  <button
                    type="button"
                    onClick={() => setPeekFix(f)}
                    aria-label={`Quick peek ${f.title}`}
                    title="Quick peek steps"
                    className="grid size-8 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-primary/60 hover:text-primary"
                  >
                    <Eye className="size-3.5" />
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={saved.includes(f.slug) ? `Unsave ${f.title}` : `Save ${f.title}`}
                    onClick={() => toggle(f.slug)}
                    className="size-8 rounded-full"
                  >
                    <Bookmark className={saved.includes(f.slug) ? "fill-primary text-primary" : "text-muted-foreground"} />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((f) => {
            const isSilenced = silenced.includes(f.slug);
            return (
              <article
                key={f.slug}
                className={`spotlight-card group flex flex-col rounded-2xl p-5 ${
                  isSilenced ? "ring-1 ring-success/40" : ""
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <AppBadge app={f.app} />
                    <span className="font-semibold text-foreground">{f.app}</span> ·{" "}
                    <span className="inline-flex items-center gap-1">
                      {f.device === "desktop" ? <Monitor className="size-3.5" /> : <Smartphone className="size-3.5" />}
                      {deviceLabel[f.device]}
                    </span>
                  </span>
                  <div className="relative z-10 flex items-center gap-1">
                    {isSilenced && (
                      <span
                        className="grid size-7 place-items-center rounded-full bg-success/15 text-success"
                        title="Marked as silenced"
                      >
                        <Check className="size-3.5" />
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setPeekFix(f)}
                      aria-label={`Quick peek ${f.title}`}
                      title="Quick peek steps"
                      className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-primary"
                    >
                      <Eye className="size-4" />
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={saved.includes(f.slug) ? `Unsave ${f.title}` : `Save ${f.title}`}
                      title={saved.includes(f.slug) ? "Unsave fix" : "Save fix"}
                      aria-pressed={saved.includes(f.slug)}
                      onClick={() => toggle(f.slug)}
                      className="size-8 rounded-full"
                    >
                      <Bookmark
                        className={saved.includes(f.slug) ? "fill-primary text-primary" : "text-muted-foreground"}
                      />
                    </Button>
                  </div>
                </div>

                <Link
                  to="/fix/$slug"
                  params={{ slug: f.slug }}
                  search={filters}
                  className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring"
                >
                  <h2 className="text-lg font-bold leading-snug transition-colors group-hover:text-primary">
                    {f.title}
                  </h2>
                </Link>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.summary}</p>

                <div className="mt-auto pt-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={f.status} />
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                      {f.category}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Official source · reviewed {f.reviewed}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
                    <span className="font-mono text-muted-foreground">
                      {f.estimatedTime} · {f.steps.length} steps
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                      View instructions <ArrowUpRight className="size-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Quick Peek Modal */}
      {peekFix && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Quick preview: ${peekFix.title}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPeekFix(null);
          }}
        >
          <div className="glass-surface max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AppBadge app={peekFix.app} size="lg" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {peekFix.app} · {deviceLabel[peekFix.device]} · {peekFix.estimatedTime}
                  </p>
                  <h3 className="font-display text-lg font-bold">{peekFix.title}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPeekFix(null)}
                aria-label="Close preview"
                className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-3">
              <StatusBadge status={peekFix.status} />
            </div>
            <ol className="mt-4 space-y-2.5 text-sm">
              {peekFix.steps.map((s, i) => (
                <li key={i} className="flex gap-2.5 rounded-xl border border-border bg-secondary/40 p-3">
                  <span className="font-mono font-bold text-primary">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex items-center justify-between gap-2">
              <a
                href={peekFix.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                {peekFix.source.label} <ArrowUpRight className="size-3.5" />
              </a>
              <Link
                to="/fix/$slug"
                params={{ slug: peekFix.slug }}
                search={filters}
                onClick={() => setPeekFix(null)}
                className="inline-flex items-center gap-1.5 rounded-full bg-hot px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md"
              >
                Open full guide <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <AeoDirectorySection onSelectApp={(app) => update({ app })} />

      <QuietPlanWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
}
