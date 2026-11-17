import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

export const filterSearch = zodValidator(
  z.object({
    q: fallback(z.string(), "").default(""),
    app: fallback(z.string(), "").default(""),
    category: fallback(z.string(), "").default(""),
    platform: fallback(z.string(), "").default(""),
    outcome: fallback(z.string(), "").default(""),
    saved: fallback(z.boolean(), false).default(false),
  }),
);

export function hasActiveFilters(filters: {
  q: string;
  app: string;
  category: string;
  platform: string;
  outcome: string;
  saved: boolean;
}) {
  return Boolean(
    filters.q ||
    filters.app ||
    filters.category ||
    filters.platform ||
    filters.outcome ||
    filters.saved,
  );
}
