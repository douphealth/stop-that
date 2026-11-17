import { fixes, type Fix } from "@/lib/fixes";

const deviceSuffix = /-(iphone|android|desktop)$/;

/**
 * Links that follow the catalog: the same task on another device, then other
 * fixes in the same app and category. Same-app fixes are the fallback when
 * nothing else shares the category.
 */
export function relatedFixes(fix: Fix, list: readonly Fix[] = fixes) {
  const stem = fix.slug.replace(deviceSuffix, "");
  const counterparts = list.filter(
    (other) => other.slug !== fix.slug && other.slug.replace(deviceSuffix, "") === stem,
  );
  const used = new Set(counterparts.map((other) => other.slug));
  const sameApp = list.filter(
    (other) => other.slug !== fix.slug && other.app === fix.app && !used.has(other.slug),
  );
  const sameCategory = sameApp.filter((other) => other.category === fix.category).slice(0, 4);
  const moreFromApp = sameCategory.length > 0 ? [] : sameApp.slice(0, 4);
  return { counterparts, sameCategory, moreFromApp };
}
