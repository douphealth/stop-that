import { apps } from "@/lib/fixes";
import { AppBadge } from "@/components/AppBadge";

export function AppMarquee({ activeApp, onSelect }: { activeApp: string; onSelect: (app: string) => void }) {
  const doubled = [...apps, ...apps];
  return (
    <div className="relative overflow-hidden py-3" aria-label="Supported apps marquee">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />
      <div className="marquee-track flex w-max gap-2.5">
        {doubled.map((app, i) => (
          <button
            key={`${app}-${i}`}
            type="button"
            onClick={() => onSelect(activeApp === app ? "" : app)}
            className={`inline-flex items-center gap-2 rounded-full border py-1 pl-1.5 pr-3 text-xs font-medium transition ${
              activeApp === app
                ? "border-primary bg-primary/15 text-foreground"
                : "border-border bg-card/70 text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            <AppBadge app={app} />
            <span>{app}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
