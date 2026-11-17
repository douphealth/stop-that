import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { emptyFilters, fixes } from "@/lib/fixes";
import { renderLlmsTxt } from "@/lib/llms";
import {
  ABOUT_DESCRIPTION,
  ABOUT_TITLE,
  DESCRIPTION_LIMIT,
  HOME_DESCRIPTION,
  HOME_TITLE,
  OG_IMAGE_PATH,
  TITLE_LIMIT,
  fixDocumentTitle,
  fixMetaDescription,
} from "@/lib/page-meta";
import { relatedFixes } from "@/lib/related-fixes";
import { indexablePaths, sitemapXml } from "@/lib/sitemap";
import { EXPLICITLY_ALLOWED_BOTS, SITE_URL, absoluteUrl, renderRobotsTxt } from "@/lib/site";
import {
  appFilterUrl,
  everyFixHasStepByStepInstructions,
  fixStructuredData,
  homeStructuredData,
} from "@/lib/structured-data";
import { routeTree } from "@/routeTree.gen";

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

  it("points robots.txt at the production sitemap and allows crawlers", () => {
    const robots = renderRobotsTxt();
    expect(robots).not.toMatch(/Disallow:/);
    expect(robots).toContain("User-agent: *\nAllow: /");
    expect(robots).toContain("Sitemap: https://stopthat.shop/sitemap.xml");
    for (const bot of EXPLICITLY_ALLOWED_BOTS) {
      expect(robots).toContain(`User-agent: ${bot}\nAllow: /`);
    }
  });

  it("keeps unique titles and descriptions within the length limits", () => {
    const titles = [HOME_TITLE, ABOUT_TITLE, ...fixes.map((fix) => fixDocumentTitle(fix.title))];
    const descriptions = [
      HOME_DESCRIPTION,
      ABOUT_DESCRIPTION,
      ...fixes.map((fix) => fixMetaDescription(fix)),
    ];
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    expect(titles.every((title) => title.length <= TITLE_LIMIT && title.length > 0)).toBe(true);
    expect(descriptions.every((description) => description.length <= DESCRIPTION_LIMIT)).toBe(true);
    for (const fix of fixes) {
      const title = fixDocumentTitle(fix.title);
      const titleWords = title.toLowerCase().match(/[a-z0-9]+/g) ?? [];
      const sourceWords = new Set(fix.title.toLowerCase().match(/[a-z0-9]+/g) ?? []);
      expect(titleWords.every((word) => sourceWords.has(word))).toBe(true);
      const description = fixMetaDescription(fix);
      expect(description === fix.summary || description.endsWith(fix.summary)).toBe(true);
    }
  });

  it("builds home and fix JSON-LD from visible fields only", () => {
    expect(everyFixHasStepByStepInstructions()).toBe(true);
    const home = homeStructuredData()["@graph"];
    expect(home.map((node) => node["@type"])).toEqual(["Organization", "WebSite"]);
    const website = home[1];
    expect(website).toMatchObject({
      potentialAction: {
        "@type": "SearchAction",
        "query-input": "required name=search_term_string",
        target: { urlTemplate: "https://stopthat.shop/?q={search_term_string}" },
      },
    });
    const sample = fixes.find((fix) => fix.slug === "youtube-next-video-autoplay-iphone");
    if (!sample) throw new Error("missing sample fix");
    const graph = fixStructuredData(sample)["@graph"];
    const breadcrumb = graph[0];
    const howTo = graph[1];
    if (!breadcrumb || !("itemListElement" in breadcrumb)) throw new Error("missing breadcrumb");
    if (!howTo || !("step" in howTo)) throw new Error("missing howto");
    expect(breadcrumb).toMatchObject({ "@type": "BreadcrumbList" });
    expect(breadcrumb.itemListElement.map((item) => item.name)).toEqual([
      "Fixes",
      sample.app,
      sample.title,
    ]);
    expect(howTo).toMatchObject({
      "@type": "HowTo",
      name: sample.title,
      description: sample.summary,
      totalTime: "PT1M",
    });
    expect(howTo.step.map((step) => step.text)).toEqual(sample.steps);
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const appHref = router.buildLocation({
      to: "/",
      search: { ...emptyFilters, app: "Uber Eats" },
    }).href;
    const uber = fixes.find((fix) => fix.app === "Uber Eats");
    if (!uber) throw new Error("missing Uber Eats fix");
    expect(appFilterUrl("Uber Eats")).toBe(absoluteUrl(appHref));
    const related = relatedFixes(sample);
    expect(related.counterparts.map((fix) => fix.slug)).toContain(
      "youtube-next-video-autoplay-android",
    );
    expect(
      related.sameCategory.every(
        (fix) => fix.app === "YouTube" && fix.category === sample.category,
      ),
    ).toBe(true);
  });

  it("lists every fix in llms.txt and publishes one IndexNow key file", () => {
    const llms = renderLlmsTxt();
    expect(llms.startsWith("# STOP THAT!\n")).toBe(true);
    expect(llms).toContain("> Make your apps less annoying.");
    for (const fix of fixes) {
      expect(llms).toContain(`https://stopthat.shop/fix/${fix.slug}`);
    }
    expect(llms).not.toContain("?");
    const keys = readdirSync("public").filter((name) => /^[0-9a-f]{32}\.txt$/.test(name));
    expect(keys).toEqual(["f704d662cb615da42ff6f24e7a80762b.txt"]);
    expect(readFileSync(`public/${keys[0]}`, "utf8")).toBe("f704d662cb615da42ff6f24e7a80762b");
    const png = readFileSync(`public${OG_IMAGE_PATH}`);
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
});
