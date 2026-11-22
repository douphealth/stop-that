import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { deviceLabel, emptyFilters, fixes, searchFixes } from "@/lib/fixes";
import { AppBadge } from "@/components/AppBadge";

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const matches = useMemo(
    () => (query.trim() ? searchFixes(fixes, query) : fixes).slice(0, 15),
    [query],
  );

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setIndex(0);
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown" && matches.length) {
        e.preventDefault();
        setIndex((i) => (i + 1) % matches.length);
      } else if (e.key === "ArrowUp" && matches.length) {
        e.preventDefault();
        setIndex((i) => (i - 1 + matches.length) % matches.length);
      } else if (e.key === "Enter" && matches[index]) {
        e.preventDefault();
        const slug = matches[index].slug;
        onClose();
        void navigate({ to: "/fix/$slug", params: { slug }, search: emptyFilters });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, matches, index, navigate, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/65 px-4 pt-16 backdrop-blur-sm sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Quick search command palette"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
          <Search className="size-5 text-primary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            placeholder="Type an app or annoyance (e.g. YouTube autoplay, WhatsApp group)…"
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            ESC
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {!matches.length ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No matching fixes. Try another app or keyword.
            </p>
          ) : (
            matches.map((fix, i) => (
              <button
                key={fix.slug}
                type="button"
                onClick={() => {
                  onClose();
                  void navigate({ to: "/fix/$slug", params: { slug: fix.slug }, search: emptyFilters });
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  i === index ? "bg-primary/15 ring-1 ring-primary/40" : "hover:bg-secondary/70"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <AppBadge app={fix.app} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{fix.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {fix.app} · {deviceLabel[fix.device]} · {fix.category}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{fix.estimatedTime}</span>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          <span>Use ↑ ↓ to navigate · Enter to open</span>
          <span>{matches.length} shown · {fixes.length} total</span>
        </div>
      </div>
    </div>
  );
}
