import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { fixes, type FixFilters } from "@/lib/fixes";
import { AppBadge } from "@/components/AppBadge";

type SimItem = {
  id: string;
  app: string;
  badge: string;
  title: string;
  sub: string;
  db: number;
  slug: string;
};

function findSlug(app: string, keyword: string): string {
  const match = fixes.find(
    (f) => f.app === app && `${f.title} ${f.slug}`.toLowerCase().includes(keyword.toLowerCase()),
  );
  return match?.slug ?? fixes[0]?.slug ?? "";
}

const BARS = [14, 24, 18, 28, 16, 22, 12];

export function HeroNoiseSimulator({ filters }: { filters: FixFilters }) {
  const items = useMemo<SimItem[]>(
    () => [
      {
        id: "sim-yt",
        app: "YouTube",
        badge: "AUTOPLAY",
        title: "Next video starting in 3s…",
        sub: "Up next: 4-hour rabbit hole you didn't ask for",
        db: 22,
        slug: findSlug("YouTube", "next video"),
      },
      {
        id: "sim-uber",
        app: "Uber Eats",
        badge: "PROMO",
        title: "Craving midnight tacos? 15% off!",
        sub: "Promotional push disguised as delivery alert",
        db: 20,
        slug: findSlug("Uber Eats", "promotions"),
      },
      {
        id: "sim-wa",
        app: "WhatsApp",
        badge: "47 UNREAD",
        title: "Extended Family Group",
        sub: "14 forwarded videos in 2 minutes",
        db: 18,
        slug: findSlug("WhatsApp", "group"),
      },
      {
        id: "sim-chrome",
        app: "Chrome",
        badge: "POP-UP",
        title: "randomblog.xyz wants to send notifications",
        sub: "Interruptive permission prompt blocking reading",
        db: 17,
        slug: findSlug("Chrome", "notification"),
      },
      {
        id: "sim-iphone",
        app: "iPhone",
        badge: "AI SUMMARY",
        title: "AI Summary: 3 chaotic messages merged",
        sub: "Apple Intelligence rewrote your friend's text",
        db: 17,
        slug: findSlug("iPhone", "summaries"),
      },
    ],
    [],
  );

  const [active, setActive] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((item) => [item.id, true])),
  );

  const activeDb = items.reduce((sum, item) => sum + (active[item.id] ? item.db : 0), 0);
  const isZen = activeDb === 0;
  const moodLabel = isZen ? "Zen Mode" : activeDb > 60 ? "Chaotic" : activeDb > 30 ? "Noisy" : "Getting quieter";
  const moodCls = isZen ? "text-success" : activeDb > 60 ? "text-primary" : "text-warning";

  const toggleAll = () => {
    const nextVal = isZen;
    setActive(Object.fromEntries(items.map((item) => [item.id, nextVal])));
  };

  return (
    <div className="glass-surface relative overflow-hidden rounded-3xl p-5 shadow-2xl">
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-border pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 items-end gap-0.5 rounded-lg bg-black/25 px-2 py-1.5" aria-hidden="true">
            {BARS.map((h, i) => (
              <span
                key={i}
                className={`eq-bar ${isZen ? "zen" : ""}`}
                style={{
                  height: `${Math.max(4, Math.round(h * (activeDb / 94)))}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <div>
            <p className={`font-mono text-xs font-semibold ${moodCls}`}>
              {activeDb} dB · {moodLabel}
            </p>
            <p className="text-[11px] text-muted-foreground">Interactive Noise Simulator</p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleAll}
          className="rounded-full border border-border bg-secondary/70 px-3 py-1 text-xs font-semibold text-foreground transition hover:border-primary/60 hover:text-primary"
        >
          {isZen ? "Replay Chaos" : "Silence All"}
        </button>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          const on = Boolean(active[item.id]);
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3 transition-all duration-300 ${
                on ? "border-border bg-secondary/50" : "border-success/30 bg-success/5 opacity-65"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <AppBadge app={item.app} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`truncate text-xs font-semibold ${
                        on ? "text-foreground" : "text-muted-foreground line-through"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`hidden shrink-0 whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[9px] font-bold sm:inline-block ${
                        on ? "bg-primary/20 text-primary" : "bg-success/20 text-success"
                      }`}
                    >
                      {on ? item.badge : "SILENCED"}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="truncate">{item.sub}</span>
                    {item.slug && (
                      <Link
                        to="/fix/$slug"
                        params={{ slug: item.slug }}
                        search={filters}
                        className="shrink-0 font-semibold text-primary hover:underline"
                      >
                        Real fix →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`Toggle ${item.app} annoyance`}
                onClick={() => setActive((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                className="toggle-track"
              >
                <span className="toggle-thumb" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
