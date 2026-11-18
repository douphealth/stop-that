// Site-wide SEO settings used by src/lib/seo-edge.ts, /sitemap.xml and /llms.txt.
export type SeoPage = { path: string; title: string; section?: string; desc?: string; lastmod?: string };
import { fixes } from "@/lib/fixes";

export const SEO = {
  origin: "https://stopthat.shop",
  pagesDevHost: "stopthat-6ci.pages.dev",
  name: "STOP THAT!",
  description: "Step-by-step fixes to turn off annoying app features (autoplay, notifications, tracking, AI features and more), each linked to the official help source.",
  lang: "en",
  logo: "/favicon.svg" as string | undefined,
  sameAs: [] as string[],
  sectionNames: {} as Record<string, string>,
  keepTrailingSlash: false,
  // Google AdSense publisher ID ("ca-pub-…"). Empty = no ad code and no /ads.txt.
  adsenseClient: "ca-pub-1683804561757910",
};

export const LLMS_NOTES: string[] = [
  "Every fix cites the official help page it is based on; app menus change, so steps carry a source link."
];

export function seoPages(): SeoPage[] {
  return [
    { path: "/", title: "STOP THAT! — turn off annoying app features", section: "Start here" },
    { path: "/about", title: "About STOP THAT!", section: "Start here" },
    ...fixes.map((f) => ({ path: `/fix/${f.slug}`, title: f.title, section: `${f.app} fixes`, desc: f.summary })),
  ];
}
