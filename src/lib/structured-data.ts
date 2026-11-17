import { fixes, type Fix } from "@/lib/fixes";
import { HOME_DESCRIPTION, ORGANIZATION_DESCRIPTION } from "@/lib/page-meta";
import { absoluteUrl } from "@/lib/site";

export function appFilterUrl(app: string): string {
  return absoluteUrl(`/?${new URLSearchParams({ app }).toString()}`);
}

export function homeStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "STOP THAT!",
        url: absoluteUrl("/"),
        description: ORGANIZATION_DESCRIPTION,
        logo: absoluteUrl("/favicon.svg"),
      },
      {
        "@type": "WebSite",
        name: "STOP THAT!",
        url: absoluteUrl("/"),
        description: HOME_DESCRIPTION,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${absoluteUrl("/")}?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

function totalTime(estimatedTime: string): string | undefined {
  if (estimatedTime === "1 min") return "PT1M";
  if (estimatedTime === "2 min") return "PT2M";
  return undefined;
}

/** BreadcrumbList plus HowTo. HowTo steps are the numbered instructions on the page. */
export function fixStructuredData(fix: Fix) {
  const pageUrl = absoluteUrl(`/fix/${fix.slug}`);
  const duration = totalTime(fix.estimatedTime);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Fixes", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: fix.app, item: appFilterUrl(fix.app) },
          { "@type": "ListItem", position: 3, name: fix.title, item: pageUrl },
        ],
      },
      {
        "@type": "HowTo",
        name: fix.title,
        description: fix.summary,
        ...(duration ? { totalTime: duration } : {}),
        step: fix.steps.map((text, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          text,
        })),
      },
    ],
  };
}

export function everyFixHasStepByStepInstructions(): boolean {
  return fixes.every((fix) => fix.steps.length > 0);
}
