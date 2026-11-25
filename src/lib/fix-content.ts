import { deviceLabel, fixes, statusLabel, type Fix } from "@/lib/fixes";

/** Long-form copy derived from fixes.json fields only. */
export type QA = { q: string; a: string };

const lcfirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
const howQ = (f: Fix) => { const t = lcfirst(f.title); return /\bon (iPhone|Android|desktop|Windows|Mac)\b/i.test(t) || f.device === "all" || f.device === "all-mobile" ? t : `${t} on ${deviceLabel[f.device]}`; };

/** "in Snapchat on iPhone", but just "on Android" when the app is the OS itself. */
const where = (f: Fix) => { const on = deviceLabel[f.device]; return f.app.toLowerCase() === String(on).toLowerCase() ? `on ${on}` : `in ${f.app} on ${on}`; };

export function shortAnswer(f: Fix): string {
  const at = where(f);
  const lead = f.status === "disable" ? `Yes. You can switch this off ${at}.`
    : f.status === "reduce" ? `Partly. You can reduce this ${at}, but the official documentation does not describe a full off switch.`
    : `There is no confirmed off switch for this ${at} in the official documentation we reviewed.`;
  return `${lead} ${f.summary} It takes ${f.steps.length} step${f.steps.length === 1 ? "" : "s"}, about ${f.estimatedTime}.`;
}

export const otherDevices = (f: Fix) => fixes.filter((x) => x.slug !== f.slug && x.app === f.app && x.category === f.category && x.device !== f.device);
export const sameCategory = (f: Fix, n = 8) => fixes.filter((x) => x.app !== f.app && x.category === f.category).slice(0, n);
export const statusText = (f: Fix) => statusLabel[f.status];

export function fixFaq(f: Fix): QA[] {
  const on = deviceLabel[f.device];
  const others = otherDevices(f);
  const out: QA[] = [
    { q: `How do I ${howQ(f)}?`, a: `${f.steps.map((s, i) => `${i + 1}. ${s}`).join(" ")} (about ${f.estimatedTime})` },
    { q: `Can I switch it off completely ${where(f)}?`, a: shortAnswer(f) },
  ];
  if (f.important) out.push({ q: `Are there any limitations?`, a: f.important });
  out.push({ q: `What if the setting isn't there?`, a: `Menus differ by app version, region and account. Update ${f.app}, check the official ${f.source.label} page for your version, and do not switch off unrelated settings as a workaround.` });
  out.push({ q: `Can I undo this change?`, a: `Yes. Return to the same setting and restore its previous value. Nothing in these steps deletes data.` });
  if (others.length) out.push({ q: `Does this work on other devices?`, a: `There are separate instructions for ${others.map((o) => deviceLabel[o.device]).join(", ")} because the menus differ. See the device table on this page.` });
  return out;
}
