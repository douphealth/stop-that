import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grain">
      <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="group flex items-center gap-2 font-display text-xl font-extrabold">
            <span className="grid size-8 place-items-center rounded-lg bg-hot text-primary-foreground group-hover:animate-wiggle">✋</span>
            STOP THAT<span className="text-primary">!</span>
          </Link>
          <div className="flex gap-1 text-sm">
            {([["/", "Fixes"], ["/about", "Standards"]] as const).map(([to, l]) => (
              <Link key={to} to={to} activeOptions={{ exact: true }} className="rounded-full px-4 py-2 text-muted-foreground transition hover:text-foreground" activeProps={{ className: "bg-secondary text-foreground" }}>{l}</Link>
            ))}
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mt-24 border-t border-border py-10 text-center text-sm text-muted-foreground">
        Independent guide. Every fix links to official vendor documentation. Not affiliated with any app listed.
      </footer>
    </div>
  );
}
