import { createFileRoute } from "@tanstack/react-router";
import { SEO } from "@/seo.config";
import { MonetizePrivacy } from "@/components/MonetizePrivacy";

const UPDATED = "2026-11-18";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [
    { title: `Privacy policy | ${SEO.name}` },
    { name: "description", content: `How ${SEO.name} handles data: no accounts, no analytics cookies, and clearly labelled partner links.` },
  ] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Privacy policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated {UPDATED}</p>
      <section className="mt-8">
        <h2 className="text-xl font-semibold">What we collect</h2>
        <p className="mt-2 text-muted-foreground">{SEO.name} has no accounts and never asks for your name, email or payment details. We do not use analytics or tracking cookies.</p>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Stored in your browser</h2>
        <p className="mt-2 text-muted-foreground">Fixes you save are kept in your browser's local storage on this device only. Clearing site data removes them.</p>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Hosting and fonts</h2>
        <p className="mt-2 text-muted-foreground">The site is served by Cloudflare, which processes technical request data such as IP address and browser type to deliver and protect it. Fonts load from Google Fonts, which receives your IP address when they download.</p>
      </section>
      <MonetizePrivacy />
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Changes</h2>
        <p className="mt-2 text-muted-foreground">We update this page whenever the data practices above change, and the date at the top shows the latest version.</p>
      </section>
    </main>
  );
}
