import raw from "@/data/fixes.json";

export type Fix = {
  slug: string; title: string; app: string; device: string; category: string;
  status: "disable" | "reduce" | "unconfirmed"; summary: string; steps: string[];
  source: { label: string; url: string }; keywords: string; important?: string;
  scope: string; estimatedTime: string; reviewed: string; note?: string; alt?: string | string[];
};

export const fixes = raw as Fix[];
export const apps = [...new Set(fixes.map((f) => f.app))].sort();
export const categories = [...new Set(fixes.map((f) => f.category))];
export const deviceLabel: Record<string, string> = {
  iphone: "iPhone", android: "Android", desktop: "Desktop", "all-mobile": "All mobile", all: "Everywhere",
};
export const statusLabel = { disable: "Can disable", reduce: "Can reduce", unconfirmed: "No confirmed switch" } as const;

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]/g, " ");

/** Deterministic weighted keyword scoring: title > app > keywords > summary. */
export function scoreFix(f: Fix, query: string): number {
  const terms = norm(query).split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return 1;
  const title = norm(f.title), app = norm(f.app), kw = norm(f.keywords + " " + f.category + " " + (deviceLabel[f.device] ?? "")), sum = norm(f.summary);
  let score = 0;
  for (const t of terms) {
    let hit = 0;
    if (app.includes(t)) hit += 5;
    if (title.includes(t)) hit += 4;
    if (kw.includes(t)) hit += 2;
    if (sum.includes(t)) hit += 1;
    score += hit;
  }
  return score;
}

export function searchFixes(list: Fix[], query: string) {
  if (!query.trim()) return list;
  return list.map((f) => [f, scoreFix(f, query)] as const).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).map(([f]) => f);
}
