import { useEffect, useState } from "react";

export const APP_THEME: Record<string, { bg: string; abbr: string; darkText?: boolean }> = {
  YouTube: { bg: "#ef4444", abbr: "YT" },
  WhatsApp: { bg: "#22c55e", abbr: "WA" },
  Instagram: { bg: "#ec4899", abbr: "IG" },
  Snapchat: { bg: "#eab308", abbr: "SC", darkText: true },
  Spotify: { bg: "#1db954", abbr: "SP" },
  Gmail: { bg: "#ea4335", abbr: "GM" },
  Chrome: { bg: "#3b82f6", abbr: "CH" },
  Safari: { bg: "#0ea5e9", abbr: "SF" },
  Android: { bg: "#84cc16", abbr: "AN", darkText: true },
  iPhone: { bg: "#64748b", abbr: "iO" },
  Windows: { bg: "#06b6d4", abbr: "WI" },
  Mac: { bg: "#71717a", abbr: "MC" },
  Reddit: { bg: "#f97316", abbr: "RD" },
  Discord: { bg: "#6366f1", abbr: "DC" },
  Slack: { bg: "#a855f7", abbr: "SL" },
  LinkedIn: { bg: "#2563eb", abbr: "IN" },
  "Microsoft Teams": { bg: "#7c3aed", abbr: "MT" },
  "Uber Eats": { bg: "#16a34a", abbr: "UE" },
  Facebook: { bg: "#1d4ed8", abbr: "FB" },
};

const SILENCED_KEY = "stopthat:silenced";
const SILENCED_EVENT = "stopthat:silenced-change";

function readSilenced(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(SILENCED_KEY) || "[]");
    return Array.isArray(value) ? value.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function useSilenced() {
  const [silenced, setSilenced] = useState<string[]>([]);

  useEffect(() => {
    setSilenced(readSilenced());
    const sync = () => setSilenced(readSilenced());
    window.addEventListener(SILENCED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SILENCED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggleSilenced = (slug: string) => {
    setSilenced((prev) => {
      const next = prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug];
      try {
        localStorage.setItem(SILENCED_KEY, JSON.stringify(next));
      } catch {
        // Storage is optional.
      }
      window.dispatchEvent(new Event(SILENCED_EVENT));
      return next;
    });
  };

  const markSilenced = (slug: string) => {
    setSilenced((prev) => {
      if (prev.includes(slug)) return prev;
      const next = [...prev, slug];
      try {
        localStorage.setItem(SILENCED_KEY, JSON.stringify(next));
      } catch {
        // Storage is optional.
      }
      window.dispatchEvent(new Event(SILENCED_EVENT));
      return next;
    });
  };

  return { silenced, toggleSilenced, markSilenced };
}
