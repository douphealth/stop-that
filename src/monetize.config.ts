// Partner / affiliate slots and Amazon tag. Everything stays invisible until a url / tag is set.
// Add the approved tracking link to "url" (and the programme name to "partner"), commit, push: Cloudflare deploys it.
export type OfferSlotId = "focus-blocker";
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
};
/** Fix categories where the focus-blocker slot is relevant. */
export const FOCUS_BLOCKER_CATEGORIES = new Set(["Notifications", "Autoplay"]);
export const OFFER_LINKS: Record<string, string> = {};
export const AMAZON = { tag: "", domain: "www.amazon.com" };
