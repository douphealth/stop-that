// Partner / affiliate slots and Amazon tag. Everything stays invisible until a url / tag is set.
export type OfferSlotId = never;
export type OfferSlot = { heading: string; body: string; cta: string; url: string; partner: string };
export const OFFER_SLOTS: Record<OfferSlotId, OfferSlot> = {};
export const OFFER_LINKS: Record<string, string> = {};
export const AMAZON = { tag: "", domain: "www.amazon.com" };
