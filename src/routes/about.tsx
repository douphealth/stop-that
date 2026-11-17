import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "Editorial standards | STOP THAT!" },
    { name: "description", content: "How STOP THAT! selects, sources and labels every fix." },
    { property: "og:title", content: "Editorial standards | STOP THAT!" },
    { property: "og:description", content: "Short answers. Long-term trust. How every fix is sourced." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: About,
});
const items = [
  ["Official sources only", "Every entry starts from documentation by the OS vendor or app maker, and links to it."],
  ["Honest labels", "Can disable: a documented switch exists. Can reduce: it helps but may not fully stop it. No confirmed switch: we say so."],
  ["Dated reviews", "The review date refers to the linked documentation, not hands-on testing on every device. Menus vary by region and version."],
  ["Evidence, not invented verification", "Official documentation, hands-on testing and community reports are different evidence types. Tested versions, reviewers and hands-on verification dates are not currently recorded; we do not invent them."],
  ["No AI guessing", "Search is deterministic matching against a curated list. Nothing invents a menu path."],
  ["We don't touch your phone", "This is a guide. Nothing here changes your settings remotely, and saved fixes stay in your browser."],
];
function About() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-20 animate-rise">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">The editorial standard</p>
      <h1 className="mt-3 text-5xl font-extrabold sm:text-6xl">Short answers.<br /><span className="text-hot">Long-term trust.</span></h1>
      <div className="mt-12 space-y-4">
        {items.map(([t, d], i) => (
          <div key={t} className="flex gap-5 border-t border-border py-6">
            <span className="font-display text-3xl font-extrabold text-primary">0{i + 1}</span>
            <div><h2 className="text-xl font-bold">{t}</h2><p className="mt-1 text-muted-foreground">{d}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
