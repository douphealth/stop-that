import { createFileRoute } from "@tanstack/react-router";
import { SEO, seoPages } from "@/seo.config";

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);

// XML sitemap built from the same data that powers the routes, so it never drifts from the site.
export const Route = createFileRoute("/sitemap.xml")({
  server: { handlers: { GET: () => {
    const origin = SEO.origin.replace(/\/$/, "");
    const seen = new Set<string>();
    const rows = seoPages().filter((p) => (seen.has(p.path) ? false : (seen.add(p.path), true)));
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows
      .map((p) => `  <url><loc>${esc(origin + p.path)}</loc>${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ""}</url>`)
      .join("\n")}\n</urlset>\n`;
    return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
  } } },
});
