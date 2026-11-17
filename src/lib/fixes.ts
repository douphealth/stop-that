import raw from "@/data/fixes.json";
import { z } from "zod";

export type Fix = {
  slug: string; title: string; app: string; device: string; category: string;
  status: "disable" | "reduce" | "unconfirmed"; summary: string; steps: string[];
  source: { label: string; url: string }; keywords: string; important?: string;
  scope: string; estimatedTime: string; reviewed: string; note?: string; alt?: string | string[];
};

const requiredText = z.string().trim().min(1);
export const fixSchema = z.object({
  slug: requiredText.regex(/^[a-z0-9-]+$/), title: requiredText, app: requiredText,
  device: z.enum(["iphone", "android", "desktop", "all-mobile", "all"]), category: requiredText,
  status: z.enum(["disable", "reduce", "unconfirmed"]), summary: requiredText,
  steps: z.array(requiredText).min(1), source: z.object({ label: requiredText, url: z.string().url().startsWith("https://") }),
  keywords: requiredText, scope: z.enum(["official-app", "os-conditional"]), estimatedTime: requiredText,
  reviewed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((s) => Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s, "Invalid review date"),
  important: requiredText.optional(), note: requiredText.optional(), alt: z.union([z.string(), z.array(requiredText)]).optional(),
});
export const catalogSchema = z.array(fixSchema).superRefine((entries, ctx) => {
  const seen = new Set<string>();
  entries.forEach((entry, index) => {
    if (seen.has(entry.slug)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [index, "slug"], message: "Duplicate fix slug" });
    seen.add(entry.slug);
  });
});
export const fixes: Fix[] = catalogSchema.parse(raw);
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
    if (app.includes(t)) hit += 6;
    if (title.includes(t)) hit += 8;
    if (kw.includes(t)) hit += 2;
    if (sum.includes(t)) hit += 1;
    if (norm(f.steps.join(" ")).includes(t)) hit += 1;
    score += hit;
  }
  return score;
}

export type FixFilters = { q: string; app: string; category: string; platform: string; outcome: string; saved: boolean };
export const emptyFilters: FixFilters = { q: "", app: "", category: "", platform: "", outcome: "", saved: false };
export function filterFixes(list: Fix[], filters: FixFilters, saved: string[] = []) {
  return searchFixes(list.filter((f) =>
    (!filters.app || f.app === filters.app) && (!filters.category || f.category === filters.category) &&
    (!filters.platform || f.device === filters.platform || f.device === "all" || (f.device === "all-mobile" && filters.platform !== "desktop")) &&
    (!filters.outcome || f.status === filters.outcome) && (!filters.saved || saved.includes(f.slug))), filters.q);
}

export function searchFixes(list: Fix[], query: string) {
  if (!query.trim()) return list;
  return list.map((f) => [f, scoreFix(f, query)] as const).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).map(([f]) => f);
}
