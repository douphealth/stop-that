const PRODUCTION_ORIGIN = "https://stopthat.shop";

function configuredSiteUrl(): string {
  const raw = import.meta.env["VITE_SITE_URL"];
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return PRODUCTION_ORIGIN;
}

/** Production origin for canonical URLs, Open Graph, sitemap, and robots.txt. */
export const SITE_URL = configuredSiteUrl().replace(/\/+$/, "");

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function robotsDirective(indexable: boolean): "index, follow" | "noindex, follow" {
  return indexable ? "index, follow" : "noindex, follow";
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function renderSitemap(locs: readonly string[]): string {
  const urls = locs.map((loc) => `  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function renderRobotsTxt(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`;
}
