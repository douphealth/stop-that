import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Bookmark, Check, Clock, Sparkles, X } from "lucide-react";
import { apps, categories, deviceLabel, emptyFilters, fixes, type Fix } from "@/lib/fixes";
import { AppBadge } from "@/components/AppBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { useSaved } from "@/lib/saved";

export function QuietPlanWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [platform, setPlatform] = useState<string>("");
  const [selectedApps, setSelectedApps] = useState<string[]>(["YouTube", "iPhone", "WhatsApp", "Chrome"]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { saved, toggle } = useSaved();

  const toggleApp = (app: string) =>
    setSelectedApps((prev) => (prev.includes(app) ? prev.filter((a) => a !== app) : [...prev, app]));

  const plan = useMemo<Fix[]>(() => {
    const matched = fixes.filter((f) => {
      const platOk =
        !platform || f.device === platform || f.device === "all" || (f.device === "all-mobile" && platform !== "desktop");
      const appOk = !selectedApps.length || selectedApps.includes(f.app);
      const catOk = !selectedCategory || f.category === selectedCategory;
      return platOk && appOk && catOk && f.status !== "unconfirmed";
    });
    return matched
      .sort((a, b) => (a.status === "disable" ? -1 : 1) - (b.status === "disable" ? -1 : 1) || parseInt(a.estimatedTime) - parseInt(b.estimatedTime))
      .slice(0, 8);
  }, [platform, selectedApps, selectedCategory]);

  const totalMins = useMemo(
    () => plan.reduce((sum, f) => sum + (parseInt(f.estimatedTime, 10) || 1), 0),
    [plan],
  );

  const saveAllPlan = () => {
    plan.forEach((f) => {
      if (!saved.includes(f.slug)) toggle(f.slug);
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Build your Quiet Plan"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="glass-surface relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-hot text-primary-foreground shadow-md">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold">Build Your Quiet Plan</h2>
              <p className="text-xs text-muted-foreground">Step {step} of 3 · Personalized from {fixes.length} source-backed fixes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close wizard"
            className="grid size-8 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Step Progress Dots */}
        <div className="mt-4 flex gap-2">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStep(n as 1 | 2 | 3)}
              className={`h-1.5 flex-1 rounded-full transition ${step >= n ? "bg-hot" : "bg-secondary"}`}
              aria-label={`Go to step ${n}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="mt-6 space-y-5">
            <div>
              <h3 className="font-display text-lg font-bold">1. Which device bugs you most?</h3>
              <p className="mt-1 text-sm text-muted-foreground">We'll match instructions tailored to its exact menus.</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {([
                  ["", "Every device"],
                  ["iphone", "iPhone"],
                  ["android", "Android"],
                  ["desktop", "Desktop"],
                ] as const).map(([val, label]) => (
                  <button
                    key={val || "all"}
                    type="button"
                    onClick={() => setPlatform(val)}
                    className={`rounded-2xl border p-4 text-center text-sm font-semibold transition ${
                      platform === val
                        ? "border-primary bg-primary/15 text-foreground ring-1 ring-primary/40"
                        : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display text-lg font-bold">2. What's your #1 annoyance?</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    !selectedCategory ? "bg-foreground text-background" : "border border-border bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  Everything annoying
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCategory(c)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      selectedCategory === c ? "bg-foreground text-background" : "border border-border bg-secondary/50 text-muted-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-full bg-hot px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-95"
              >
                Pick your apps <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-bold">Select your noisiest apps</h3>
                <p className="text-xs text-muted-foreground">Tap apps to include in your sprint ({selectedApps.length} selected).</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApps(selectedApps.length === apps.length ? [] : [...apps])}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {selectedApps.length === apps.length ? "Clear all" : "Select all"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {apps.map((app) => {
                const active = selectedApps.includes(app);
                return (
                  <button
                    key={app}
                    type="button"
                    onClick={() => toggleApp(app)}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition ${
                      active
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <AppBadge app={app} />
                      <span className="truncate">{app}</span>
                    </span>
                    {active && <Check className="size-3.5 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(1)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 rounded-full bg-hot px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-95"
              >
                Generate Quiet Plan <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-success/30 bg-success/10 p-4">
              <div>
                <p className="font-display text-lg font-bold text-foreground">
                  Your {totalMins}-Minute Silence Sprint
                </p>
                <p className="text-xs text-muted-foreground">
                  {plan.length} confirmed official-doc fixes ready to knock out right now.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-3 py-1 font-mono text-xs font-semibold text-success">
                  <Clock className="size-3.5" /> ~{totalMins} min
                </span>
                {plan.length > 0 && (
                  <button
                    type="button"
                    onClick={saveAllPlan}
                    className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background transition hover:opacity-90"
                  >
                    <Bookmark className="size-3" /> Save all
                  </button>
                )}
              </div>
            </div>

            {!plan.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No confirmed fixes match that exact combination. Go back and select more apps or "Every device".
              </p>
            ) : (
              <div className="space-y-2">
                {plan.map((fix) => (
                  <Link
                    key={fix.slug}
                    to="/fix/$slug"
                    params={{ slug: fix.slug }}
                    search={emptyFilters}
                    onClick={onClose}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/40 p-3.5 transition hover:border-primary/60"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <AppBadge app={fix.app} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{fix.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{deviceLabel[fix.device]}</span>
                          <span>·</span>
                          <span className="font-mono">{fix.estimatedTime}</span>
                          <StatusBadge status={fix.status} />
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-primary" />
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(2)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                ← Adjust apps
              </button>
              <button type="button" onClick={onClose} className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:border-primary">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
