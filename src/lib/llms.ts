import { apps, fixes } from "@/lib/fixes";
import { HOME_DESCRIPTION, ORGANIZATION_DESCRIPTION } from "@/lib/page-meta";
import { absoluteUrl } from "@/lib/site";

function linkTitle(title: string): string {
  return title.replaceAll("[", "\\[").replaceAll("]", "\\]");
}

/** llmstxt.org-style summary. Every catalog fix is listed; the data has no smaller ranked set. */
export function renderLlmsTxt(): string {
  const lines = [
    "# STOP THAT!",
    "",
    "> Make your apps less annoying.",
    "",
    ORGANIZATION_DESCRIPTION,
    "",
    HOME_DESCRIPTION,
    "",
    `${fixes.length} fixes across ${apps.length} apps. Each entry is step-by-step instructions linked to official documentation. The review date is a documentation review, not a record of hands-on device testing.`,
    "",
    `Editorial standards: ${absoluteUrl("/about")}`,
    "",
  ];
  for (const app of apps) {
    lines.push(`## ${app}`, "");
    for (const fix of fixes.filter((entry) => entry.app === app)) {
      lines.push(`- [${linkTitle(fix.title)}](${absoluteUrl(`/fix/${fix.slug}`)}): ${fix.summary}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
