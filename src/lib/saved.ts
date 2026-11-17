import { useEffect, useState } from "react";
const KEY = "stopthat:saved";
export function useSaved() {
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => { try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) || "[]");
    setSaved(Array.isArray(value) ? value.filter((s): s is string => typeof s === "string") : []);
  } catch { /* Storage is optional. */ } }, []);
  const toggle = (slug: string) => setSaved((s) => {
    const n = s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug];
    try { localStorage.setItem(KEY, JSON.stringify(n)); } catch { /* Keep usable in-memory saves when storage is unavailable. */ }
    return n;
  });
  return { saved, toggle };
}
