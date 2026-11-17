import { deviceLabel, fixes, type Fix } from "@/lib/fixes";
import { absoluteUrl } from "@/lib/site";

export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 160;

/** Visible home heading plus the visible tagline under it. */
export const HOME_TITLE = "STOP THAT! — Make your apps less annoying";
/** The paragraph under the home tagline. */
export const HOME_DESCRIPTION =
  "Notifications, autoplay, pop-ups and unwanted AI features. Exact instructions, official sources, and honest answers when no switch is confirmed.";

/** Visible about heading. */
export const ABOUT_TITLE = "Short answers. Long-term trust.";
/** What the editorial-standards page actually explains. */
export const ABOUT_DESCRIPTION = "How STOP THAT! selects, sources and labels every fix.";

/** Footer line, also used as the Organization description. */
export const ORGANIZATION_DESCRIPTION =
  "Independent guide. Every fix links to official vendor documentation. Not affiliated with any app listed.";

export const OG_IMAGE_PATH = "/og.png";
export const OG_IMAGE_ALT = "STOP THAT! Make your apps less annoying.";

const PHRASES_REMOVED_ONLY_WHEN_TITLE_EXCEEDS_LIMIT = ["important ", "intrusive "];

/**
 * Document title from the fix's own title. The full title is kept when it
 * already fits. The three titles over 60 characters drop one adjective that
 * is already in that title; the page H1 stays the full catalog title.
 */
export function fixDocumentTitle(title: string): string {
  let next = title;
  for (const phrase of PHRASES_REMOVED_ONLY_WHEN_TITLE_EXCEEDS_LIMIT) {
    if (next.length <= TITLE_LIMIT) break;
    next = next.replace(phrase, "");
  }
  if (next.length > TITLE_LIMIT) {
    throw new Error(`Cannot fit a title within ${TITLE_LIMIT} characters: ${title}`);
  }
  return next;
}

/** Summary text. Device and app are prefixed only when two fixes share a summary. */
export function fixMetaDescription(fix: Fix): string {
  const shared = fixes.filter((other) => other.summary === fix.summary);
  if (shared.length === 1) return fix.summary;
  const distinguished = `${fix.app} on ${deviceLabel[fix.device]}: ${fix.summary}`;
  if (distinguished.length > DESCRIPTION_LIMIT) {
    throw new Error(`Description exceeds ${DESCRIPTION_LIMIT} characters for ${fix.slug}`);
  }
  return distinguished;
}

export function shareMeta(title: string, description: string) {
  const image = absoluteUrl(OG_IMAGE_PATH);
  return [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: OG_IMAGE_ALT },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: OG_IMAGE_ALT },
  ];
}
