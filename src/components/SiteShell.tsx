import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUp, Moon, Search, Sun } from "lucide-react";
import { fixes } from "@/lib/fixes";
import { useSilenced } from "@/lib/app-theme";
import { CommandPalette } from "@/components/CommandPalette";

export function SiteShell({ children }: { children: ReactNode }) {
  const { silenced } = useSilenced();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [light, setLight] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("stopthat:theme");
      if (saved === "light") {
        setLight(true);
        document.documentElement.classList.add("light");
      }
    } catch {
      // Storage is optional.
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      } else if (
        e.key === "/" &&
        !cmdOpen &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const card = target?.closest<HTMLElement>(".spotlight-card");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(docH > 0 ? Math.min(100, (window.scrollY / docH) * 100) : 0);
      setShowTop(window.scrollY > 420);
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [cmdOpen]);

  const toggleTheme = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("stopthat:theme", next ? "light" : "dark");
    } catch {
      // Storage is optional.
    }
  };

  const circ = 56.55;
  const dashOffset = circ * (1 - silenced.length / Math.max(1, fixes.length));

  return (
    <div className="relative min-h-screen grain">
      <div
        className="fixed left-0 top-0 z-50 h-0.5 bg-hot transition-[width] duration-75"
        style={{ width: `${scrollPct}%` }}
        aria-hidden="true"
      />
      <div className="aurora-orb orb-coral" aria-hidden="true" />
      <div className="aurora-orb orb-amber" aria-hidden="true" />
      <div className="aurora-orb orb-mint" aria-hidden="true" />

      <header className="sticky top-0 z-30 border-b border-border bg-background/75 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5">
          <Link to="/" className="group flex items-center gap-2.5 font-display text-xl font-extrabold">
            <span className="grid size-9 place-items-center rounded-xl bg-hot text-primary-foreground shadow-lg group-hover:animate-wiggle">
              ✋
            </span>
            <span>
              STOP THAT<span className="text-primary">!</span>
            </span>
          </Link>

          <div className="flex items-center gap-1 text-sm">
            {([["/", "Fixes"], ["/about", "Standards"]] as const).map(([to, l]) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: true }}
                className="rounded-full px-3.5 py-1.5 font-medium text-muted-foreground transition hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground ring-1 ring-border" }}
              >
                {l}
                {to === "/" && (
                  <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary">
                    {fixes.length}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground sm:inline-flex"
              title="Quick Search (Cmd+K or /)"
            >
              <Search className="size-3.5" />
              <span>Quick search</span>
              <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
            </button>

            <div
              className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
              title={`${silenced.length} of ${fixes.length} fixes marked silenced in this browser`}
            >
              <svg className="size-4 -rotate-90" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 0.45s ease" }}
                />
              </svg>
              <span className="font-mono">
                {silenced.length}/{fixes.length}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              title="Toggle Dark / Light mode"
              className="grid size-8 place-items-center rounded-full border border-border bg-card/70 text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
            >
              {light ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 mt-24 border-t border-border py-10 text-center text-sm text-muted-foreground">
        Independent guide. Every fix links to official vendor documentation. Not affiliated with any app listed.{" "}
        <a href="/privacy" className="underline underline-offset-4 hover:text-foreground">
          Privacy policy
        </a>
      </footer>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-40 grid size-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-xl transition-all duration-300 hover:border-primary hover:text-primary ${
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <ArrowUp className="size-5" />
      </button>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
