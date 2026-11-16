import { describe, it, expect } from "vitest";
import { fixes, searchFixes } from "@/lib/fixes";
describe("fixes", () => {
  it("ships all 78 fixes with official sources", () => {
    expect(fixes).toHaveLength(78);
    expect(fixes.every((f) => f.source.url.startsWith("https://"))).toBe(true);
  });
  it("ranks matching app first", () => {
    expect(searchFixes(fixes, "uber eats")[0].app).toBe("Uber Eats");
  });
});
