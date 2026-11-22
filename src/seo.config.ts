// Site-wide SEO, AEO & GEO settings used by src/lib/seo-edge.ts, /sitemap.xml, /llms.txt and /llms-full.txt.
export type SeoPage = { path: string; title: string; section?: string; desc?: string; lastmod?: string };
import { apps, fixes } from "@/lib/fixes";

export const SEO = {
  origin: "https://stopthat.shop",
  pagesDevHost: "stopthat-6ci.pages.dev",
  name: "STOP THAT!",
  description: `Step-by-step, official-source-backed fixes to turn off annoying app features across ${apps.length} apps (${fixes.length} guides for notifications, autoplay, pop-ups, privacy, and unwanted AI features).`,
  lang: "en",
  logo: "/favicon.svg" as string | undefined,
  sameAs: ["https://github.com/douphealth/stop-that"] as string[],
  sectionNames: { fix: "Fixes", about: "Editorial Standards", privacy: "Privacy Policy" } as Record<string, string>,
  keepTrailingSlash: false,
  // Google AdSense publisher ID ("ca-pub-…"). Empty = no ad code and no /ads.txt.
  adsenseClient: "ca-pub-1683804561757910",
};

export const LLMS_NOTES: string[] = [
  "Every fix cites the official OS vendor or app maker documentation it is based on; app menus change, so every guide carries a direct source link and review date.",
  "Outcome taxonomy: 'Can disable' (confirmed off switch documented), 'Can reduce' (partial control documented), 'No confirmed switch' (honestly noted when vendor docs lack a guaranteed switch).",
  "Documentation review dates reflect when official documentation was reviewed, not hands-on testing on every device or OS version.",
  "For complete step-by-step instructions, limitations, and official URLs for all fixes in a single Markdown document, fetch https://stopthat.shop/llms-full.txt.",
];

const latestReview = fixes.reduce((max, f) => (f.reviewed > max ? f.reviewed : max), "2026-10-31");

export function seoPages(): SeoPage[] {
  return [
    {
      path: "/",
      title: `STOP THAT! — ${fixes.length} source-backed fixes for annoying apps`,
      section: "Start here",
      desc: SEO.description,
      lastmod: latestReview,
    },
    {
      path: "/about",
      title: "Editorial Standards — How STOP THAT! Sources & Labels Fixes",
      section: "Start here",
      desc: "Official sources only, honest outcome labels, dated documentation reviews, and zero AI guesswork.",
      lastmod: latestReview,
    },
    ...fixes.map((f) => ({
      path: `/fix/${f.slug}`,
      title: f.title,
      section: `${f.app} fixes`,
      desc: `${f.summary} (${f.estimatedTime}, reviewed ${f.reviewed})`,
      lastmod: f.reviewed,
    })),
  ];
}
