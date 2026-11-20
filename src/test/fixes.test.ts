import { describe, it, expect } from "vitest";
import { fixes, searchFixes, catalogSchema, fixSchema, filterFixes, emptyFilters } from "@/lib/fixes";
describe("fixes", () => {
  it("ships all 78 fixes with official sources", () => {
    expect(fixes).toHaveLength(83);
    expect(fixes.every((f) => f.source.url.startsWith("https://"))).toBe(true);
  });
  it("ranks matching app first", () => {
    expect(searchFixes(fixes, "uber eats")[0]?.app).toBe("Uber Eats");
  });
  it("rejects a missing summary", () => {
    expect(fixSchema.safeParse({ ...fixes[0], summary: " " }).success).toBe(false);
  });
  it("rejects missing instructions", () => {
    expect(fixSchema.safeParse({ ...fixes[0], steps: [] }).success).toBe(false);
  });
  it("rejects insecure evidence links", () => {
    expect(fixSchema.safeParse({ ...fixes[0], source: { label: "Android Help", url: "http://support.google.com" } }).success).toBe(false);
  });
  it("rejects duplicate slugs", () => {
    expect(catalogSchema.safeParse([fixes[0], fixes[0]]).success).toBe(false);
  });
  it("rejects unsupported outcomes", () => {
    expect(fixSchema.safeParse({ ...fixes[0], status: "guaranteed" }).success).toBe(false);
  });
  it("does not include all-mobile instructions in desktop results", () => {
    const results = filterFixes(fixes, { ...emptyFilters, platform: "desktop" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((f) => f.device === "desktop" || f.device === "all")).toBe(true);
  });
  it("filters by outcome", () => {
    const results = filterFixes(fixes, { ...emptyFilters, outcome: "unconfirmed" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((f) => f.status === "unconfirmed")).toBe(true);
  });
  it("searches exact instruction labels", () => {
    const first = fixes[0];
    if (!first) throw new Error("Catalog is empty");
    const example = { ...first, title: "Example", app: "Example", keywords: "example", category: "Example", summary: "Example", steps: ["Open specialneedle settings"] };
    expect(searchFixes([example], "specialneedle")).toHaveLength(1);
  });
});
