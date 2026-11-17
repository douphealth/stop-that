import { describe, expect, it } from "vitest";
import { fixes } from "@/lib/fixes";
import { indexablePaths, sitemapXml } from "@/lib/sitemap";
import { SITE_URL, absoluteUrl, renderRobotsTxt } from "@/lib/site";

describe("production SEO origin", () => {
  it("uses the production origin", () => {
    expect(SITE_URL).toBe("https://stopthat.shop");
    expect(absoluteUrl("/")).toBe("https://stopthat.shop/");
    expect(absoluteUrl("/fix/youtube-next-video-autoplay-iphone")).toBe(
      "https://stopthat.shop/fix/youtube-next-video-autoplay-iphone",
    );
  });

  it("lists home and every fix on clean URLs in valid sitemap XML", () => {
    const xml = sitemapXml();
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    expect(doc.querySelector("parsererror")).toBeNull();
    expect(doc.documentElement.localName).toBe("urlset");
    const locs = [...doc.querySelectorAll("loc")].map((node) => node.textContent);
    expect(locs[0]).toBe("https://stopthat.shop/");
    for (const fix of fixes) {
      expect(locs).toContain(`https://stopthat.shop/fix/${fix.slug}`);
    }
    expect(
      locs.every((loc) => loc?.startsWith("https://stopthat.shop/") && !loc.includes("?")),
    ).toBe(true);
    expect(new Set(locs).size).toBe(locs.length);
    expect(indexablePaths()).toContain("/");
    expect(indexablePaths().filter((path) => path.startsWith("/fix/"))).toHaveLength(fixes.length);
  });

  it("points robots.txt at the production sitemap and allows crawling", () => {
    const robots = renderRobotsTxt();
    expect(robots).toContain("Allow: /");
    expect(robots).not.toMatch(/Disallow:\s*\/\s*$/m);
    expect(robots).toContain("Sitemap: https://stopthat.shop/sitemap.xml");
  });
});
