import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { deviceLabel, fixes } from "@/lib/fixes";
import { StatusBadge } from "@/components/StatusBadge";
import { useSaved } from "@/lib/saved";

export const Route = createFileRoute("/fix/$slug")({
  loader: ({ params }) => {
    const fix = fixes.find((f) => f.slug === params.slug);
    if (!fix) throw notFound();
    return { fix };
  },
  head: ({ loaderData }) => loaderData ? {
    meta: [
      { title: `${loaderData.fix.title} | STOP THAT!` },
      { name: "description", content: loaderData.fix.summary },
      { property: "og:title", content: loaderData.fix.title },
      { property: "og:description", content: loaderData.fix.summary },
      { property: "og:type", content: "article" },
    ],
  } : { meta: [{ title: "Fix unavailable | STOP THAT!" }, { name: "robots", content: "noindex" }] },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="text-4xl font-bold">That fix doesn't exist.</h1>
      <Link to="/" className="mt-6 inline-block text-primary">← Back to all fixes</Link>
    </div>
  ),
  component: FixPage,
});

function FixPage() {
  const { fix } = Route.useLoaderData();
  const [done, setDone] = useState<number[]>([]);
  const { saved, toggle } = useSaved();
  const pct = Math.round((done.length / fix.steps.length) * 100);
  const related = fixes.filter((f) => f.app === fix.app && f.slug !== fix.slug).slice(0, 4);
  const isSaved = saved.includes(fix.slug);

  return (
    <article className="mx-auto max-w-3xl px-5 pt-14 animate-rise">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← All fixes</Link>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <StatusBadge status={fix.status} />
        <span>{fix.app}</span>·<span>{deviceLabel[fix.device]}</span>·<span>{fix.category}</span>·<span>⏱ {fix.estimatedTime}</span>
      </div>
      <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">{fix.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{fix.summary}</p>

      <section className="mt-10 rounded-3xl bg-card p-6 ring-1 ring-border sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Do this</h2>
          <span className="text-sm font-semibold text-primary">{pct === 100 ? "Done 🎉" : `${done.length}/${fix.steps.length}`}</span>
        </div>
        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-hot transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <ol className="space-y-3">
          {fix.steps.map((s, i) => {
            const on = done.includes(i);
            return (
              <li key={i}>
                <button onClick={() => setDone(on ? done.filter((x) => x !== i) : [...done, i])}
                  className={`flex w-full items-start gap-4 rounded-2xl p-4 text-left ring-1 transition ${on ? "bg-success/10 ring-success/40" : "ring-border hover:ring-primary/50"}`}>
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold transition ${on ? "bg-success text-accent-foreground" : "bg-secondary"}`}>{on ? "✓" : i + 1}</span>
                  <span className={on ? "text-muted-foreground line-through" : ""}>{s}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {fix.important && (
        <aside className="mt-6 rounded-2xl bg-warning/10 p-5 text-sm ring-1 ring-warning/30"><strong className="text-warning">Heads up · </strong>{fix.important}</aside>
      )}
      {fix.alt && <aside className="mt-4 rounded-2xl bg-secondary p-5 text-sm"><strong>Alternative · </strong>{fix.alt}</aside>}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a href={fix.source.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-hot px-5 py-2.5 font-semibold text-primary-foreground shadow-glow transition hover:scale-105">Source: {fix.source.label} ↗</a>
        <button onClick={() => toggle(fix.slug)} className="rounded-full px-5 py-2.5 ring-1 ring-border hover:ring-foreground/40">{isSaved ? "★ Saved" : "☆ Save fix"}</button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Source reviewed {fix.reviewed}. {fix.note}</p>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-xl font-bold">More {fix.app} fixes</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <Link key={r.slug} to="/fix/$slug" params={{ slug: r.slug }} className="rounded-2xl bg-card p-4 ring-1 ring-border transition hover:ring-primary/60">
                <p className="font-semibold">{r.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{deviceLabel[r.device]} · {r.estimatedTime}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
