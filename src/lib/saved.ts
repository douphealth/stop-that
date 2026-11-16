import { useEffect, useState } from "react";
const KEY = "stopthat:saved";
export function useSaved() {
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => { try { setSaved(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { /* ignore */ } }, []);
  const toggle = (slug: string) => setSaved((s) => {
    const n = s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug];
    localStorage.setItem(KEY, JSON.stringify(n)); return n;
  });
  return { saved, toggle };
}
