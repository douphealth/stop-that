import { statusLabel, type Fix } from "@/lib/fixes";
const cls = {
  disable: "bg-success/15 text-success ring-success/30",
  reduce: "bg-warning/15 text-warning ring-warning/30",
  unconfirmed: "bg-muted text-muted-foreground ring-border",
};
export function StatusBadge({ status }: { status: Fix["status"] }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${cls[status]}`}><span className="size-1.5 rounded-full bg-current" />{statusLabel[status]}</span>;
}
