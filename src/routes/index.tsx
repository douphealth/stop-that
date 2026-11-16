import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { apps, categories, deviceLabel, fixes, searchFixes } from "@/lib/fixes";
import { StatusBadge } from "@/components/StatusBadge";
import { useSaved } from "@/lib/saved";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "STOP THAT! — 78 source-backed fixes for annoying apps" },
      { name: "description", content: "Search official, step-by-step fixes to silence notifications, pop-ups, autoplay and AI features on iPhone, Android and desktop." },
      { property: "og:title", content: "STOP THAT! — Make the noise stop" },
      { property: "og:description", content: "78 official-source-backed fixes for notifications, pop-ups and autoplay." },
    ],
  }),
  component: Index,
});

const examples = ["YouTube shorts", "WhatsApp groups", "iPhone summaries", "Chrome popups", "Discord @everyone"];
const devices = ["iphone", "android", "desktop"];

function Index() {
  const [q, setQ] = useState("");
  const [app, setApp] = useState("");
  const [cat, setCat] = useState("");
  const [dev, setDev] = useState("");
  const [onlySaved, setOnlySaved] = useState(false);
  const { saved, toggle } = useSaved();

  const results = useMemo(() => {
    const base = fixes.filter((f) =>
      (!app || f.app === app) && (!cat || f.category === cat) &&
      (!dev || f.device === dev || f.device.startsWith("all")) && (!onlySaved || saved.includes(f.slug)));
    return searchFixes(base, q);
  }, [q, app, cat, dev, onlySaved, saved]);

  const chip = (active: boolean) => `rounded-full px-3.5 py-1.5 text-sm transition ring-1 ${active ? "bg-primary text-primary-foreground ring-primary shadow-glow" : "ring-border text-muted-foreground hover:text-foreground hover:ring-foreground/30"}`;

  return (
    <div className="mx-auto max-w-6xl px-5">
      <section className="pt-20 pb-12 text-center animate-rise">
        <p className="mx-auto mb-6 w-fit rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border">
          {fixes.length} fixes · {apps.length} apps · every one linked to official docs
        </p>
        <h1 className="text-6xl font-extrabold leading-[0.95] sm:text-8xl">Make the <span className="text-hot">noise</span><br />stop.</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">Type what's bugging you. Get the exact switch — and an honest answer when one doesn't exist.</p>
        <div className="mx-auto mt-10 max-w-2xl">
          <div className="flex items-center gap-3 rounded-2xl bg-card px-5 py-4 ring-1 ring-border shadow-glow focus-within:ring-primary transition">
            <span className="text-xl">🔎</span>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. stop YouTube autoplay on iPhone"
              aria-label="Search fixes" className="w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground" />
            {q && <button onClick={() => setQ("")} className="text-sm text-muted-foreground hover:text-foreground">Clear</button>}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {examples.map((e) => <button key={e} onClick={() => setQ(e)} className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground hover:text-foreground">{e}</button>)}
          </div>
        </div>
      </section>

      <section className="space-y-3 border-y border-border py-6">
        <div className="flex flex-wrap gap-2">
          <button className={chip(!cat)} onClick={() => setCat("")}>All types</button>
          {categories.map((c) => <button key={c} className={chip(cat === c)} onClick={() => setCat(cat === c ? "" : c)}>{c}</button>)}
          <span className="mx-1 w-px bg-border" />
          {devices.map((d) => <button key={d} className={chip(dev === d)} onClick={() => setDev(dev === d ? "" : d)}>{deviceLabel[d]}</button>)}
          <span className="mx-1 w-px bg-border" />
          <button className={chip(onlySaved)} onClick={() => setOnlySaved(!onlySaved)}>★ Saved ({saved.length})</button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {apps.map((a) => <button key={a} className={chip(app === a) + " shrink-0"} onClick={() => setApp(app === a ? "" : a)}>{a}</button>)}
        </div>
      </section>

      <p className="mt-8 mb-4 text-sm text-muted-foreground">{results.length} {results.length === 1 ? "fix" : "fixes"}</p>
      {results.length === 0 ? (
        <div className="rounded-2xl bg-card p-12 text-center ring-1 ring-border">
          <p className="text-2xl font-bold">Nothing matched.</p>
          <p className="mt-2 text-muted-foreground">Try the app name plus what it does, like "Spotify ads" or "Teams sounds".</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((f, i) => (
            <div key={f.slug} style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
              className="group relative flex flex-col rounded-2xl bg-card p-5 ring-1 ring-border transition duration-300 hover:-translate-y-1 hover:ring-primary/60 hover:shadow-glow animate-rise">
              <div className="mb-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{f.app} · {deviceLabel[f.device]}</span>
                <button aria-label={saved.includes(f.slug) ? "Unsave" : "Save"} onClick={() => toggle(f.slug)}
                  className={`relative z-10 text-lg transition hover:scale-125 ${saved.includes(f.slug) ? "text-accent" : "text-muted-foreground"}`}>{saved.includes(f.slug) ? "★" : "☆"}</button>
              </div>
              <Link to="/fix/$slug" params={{ slug: f.slug }} className="after:absolute after:inset-0">
                <h3 className="text-lg font-bold leading-snug group-hover:text-primary transition">{f.title}</h3>
              </Link>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{f.summary}</p>
              <div className="mt-auto flex items-center justify-between pt-4">
                <StatusBadge status={f.status} />
                <span className="text-xs text-muted-foreground">⏱ {f.estimatedTime}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
