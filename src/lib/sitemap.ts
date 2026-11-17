import { fixes } from "@/lib/fixes";
import { absoluteUrl, renderSitemap } from "@/lib/site";

/** Clean indexable URLs: home, editorial standards, and every fix page. */
export function indexablePaths(): string[] {
  return ["/", "/about", ...fixes.map((fix) => `/fix/${fix.slug}`)];
}

export function sitemapXml(): string {
  return renderSitemap(indexablePaths().map((path) => absoluteUrl(path)));
}
