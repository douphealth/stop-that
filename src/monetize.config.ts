// Partner / affiliate slots and Amazon tag. Everything stays invisible until a url / tag is set.
// Add the approved tracking link to "url" (and the programme name to "partner"), commit, push: Cloudflare deploys it.
export type OfferSlotId = "focus-blocker" | "data-removal";
export type OfferSlot = { heading: string; body: string; cta: string; url: string; partner: string };
export const OFFER_SLOTS: Record<OfferSlotId, OfferSlot> = {
  // Freedom affiliate programme (impact.com): shown on Notifications and Autoplay fixes.
  "focus-blocker": {
    heading: "Still getting pulled back into {context}?",
    body: "Turning off alerts helps, but the app is still one tap away. Freedom blocks chosen apps and websites on a schedule, across your phone and computer.",
    cta: "Try Freedom",
    url: "",
    partner: "Freedom",
  },
  // Incogni affiliate programme (HasOffers/TUNE): shown on Privacy fixes.
  "data-removal": {
    heading: "Want less spam reaching you in the first place?",
    body: "Settings hide what reaches your screen. Incogni asks data brokers to delete your personal information, which can reduce spam calls, texts and emails over time.",
    cta: "See how Incogni works",
    // Incogni Revenue Share, offer 2, affiliate 3193 (40% of revenue). Approved 24 Nov 2026.
    url: "https://deal.incogni.io/aff_c?offer_id=2&aff_id=3193&source=stopthat",
    partner: "Incogni",
  },
};
/** Fix categories where the data-removal slot is relevant. */
export const DATA_REMOVAL_CATEGORIES = new Set(["Privacy"]);
/** Fix categories where the focus-blocker slot is relevant. */
export const FOCUS_BLOCKER_CATEGORIES = new Set(["Notifications", "Autoplay"]);
export const OFFER_LINKS: Record<string, string> = {};
export const AMAZON = { tag: "", domain: "www.amazon.com" };
