import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { emptyFilters } from "@/lib/fixes";
import { routeTree } from "@/routeTree.gen";

const sampleSlug = "youtube-next-video-autoplay-iphone";

function createTestRouter() {
  return createRouter({ routeTree, context: { queryClient: new QueryClient() } });
}

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createTestRouter();

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("keeps default filter values in route state when the URL is clean", () => {
    const router = createTestRouter();
    const search = router.matchRoutes("/").at(-1)?.search;

    expect(search).toMatchObject(emptyFilters);
  });

  it("omits empty filter params and keeps active ones", () => {
    const router = createTestRouter();

    expect(router.buildLocation({ to: "/", search: emptyFilters }).href).toBe("/");
    expect(
      router.buildLocation({
        to: "/fix/$slug",
        params: { slug: sampleSlug },
        search: emptyFilters,
      }).href,
    ).toBe(`/fix/${sampleSlug}`);
    expect(
      router.buildLocation({
        to: "/fix/$slug",
        params: { slug: sampleSlug },
        search: { ...emptyFilters, platform: "iphone" },
      }).href,
    ).toBe(`/fix/${sampleSlug}?platform=iphone`);

    const params = new URL(
      router.buildLocation({
        to: "/",
        search: { ...emptyFilters, q: "autoplay", saved: true },
      }).href,
      "https://stopthat.shop",
    ).searchParams;
    expect(params.get("q")).toBe("autoplay");
    expect(params.get("saved")).toBe("true");
    expect(params.has("app")).toBe(false);
    expect(params.has("category")).toBe(false);
    expect(params.has("platform")).toBe(false);
    expect(params.has("outcome")).toBe(false);
  });
});
