import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { fixes } from "@/lib/fixes";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Editorial standards | STOP THAT!" },
      { name: "description", content: "How STOP THAT! selects, sources and labels every fix." },
      { property: "og:title", content: "Editorial standards | STOP THAT!" },
      { property: "og:description", content: "Short answers. Long-term trust. How every fix is sourced." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const items = [
  ["Official sources only", "Every entry starts from documentation by the OS vendor or app maker, and links to it."],
  [
    "Honest labels",
    "Can disable: a documented switch exists. Can reduce: it helps but may not fully stop it. No confirmed switch: we say so.",
  ],
  [
    "Dated reviews",
    "The review date refers to the linked documentation, not hands-on testing on every device. Menus vary by region and version.",
  ],
  [
    "Evidence, not invented verification",
    "Official documentation, hands-on testing and community reports are different evidence types. Tested versions, reviewers and hands-on verification dates are not currently recorded; we do not invent them.",
  ],
  ["No AI guessing", "Search is deterministic matching against a curated list. Nothing invents a menu path."],
  [
    "We don't touch your phone",
    "This is a guide. Nothing here changes your settings remotely, and saved fixes stay in your browser.",
  ],
];

function About() {
  const disableCount = fixes.filter((f) => f.status === "disable").length;
  const reduceCount = fixes.filter((f) => f.status === "reduce").length;
  const unconfCount = fixes.filter((f) => f.status === "unconfirmed").length;

  return (
    <div className="mx-auto max-w-3xl px-5 pt-16 animate-rise">
      <p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">The editorial standard</p>
      <h1 className="mt-3 text-5xl font-extrabold sm:text-6xl">
        Short answers.
        <br />
        <span className="text-hot">Long-term trust.</span>
      </h1>

      <div className="mt-8 grid grid-cols-3 gap-3">
        <div className="glass-surface rounded-2xl p-4 text-center">
          <p className="font-display text-3xl font-extrabold text-success">{disableCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">Can disable</p>
        </div>
        <div className="glass-surface rounded-2xl p-4 text-center">
          <p className="font-display text-3xl font-extrabold text-warning">{reduceCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">Can reduce</p>
        </div>
        <div className="glass-surface rounded-2xl p-4 text-center">
          <p className="font-display text-3xl font-extrabold text-foreground">{unconfCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">No confirmed switch</p>
        </div>
      </div>

      <div className="mt-10 space-y-3">
        {items.map(([t, d], i) => (
          <div key={t} className="spotlight-card flex gap-5 rounded-2xl p-5">
            <span className="font-display text-3xl font-extrabold text-hot">0{i + 1}</span>
            <div>
              <h2 className="text-xl font-bold">{t}</h2>
              <p className="mt-1 text-muted-foreground">{d}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-hot px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-95"
        >
          Explore all {fixes.length} fixes <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
