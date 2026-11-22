import { APP_THEME } from "@/lib/app-theme";

export function AppBadge({ app, size = "sm" }: { app: string; size?: "sm" | "lg" }) {
  const theme = APP_THEME[app] ?? { bg: "#64748b", abbr: app.slice(0, 2).toUpperCase() };
  const dims = size === "lg" ? "size-10 rounded-xl text-xs" : "size-6 rounded-md text-[10px]";
  const textCls = theme.darkText ? "text-zinc-950" : "text-white";
  return (
    <span
      className={`inline-grid shrink-0 place-items-center font-mono font-bold shadow-sm ${dims} ${textCls}`}
      style={{ backgroundColor: theme.bg }}
      aria-hidden="true"
    >
      {theme.abbr}
    </span>
  );
}
