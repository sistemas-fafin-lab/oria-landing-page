"use client";

/* ─────────────────────────────────────────────────────────────
   ORIA — Global theme store
   Centralises light / dark / system into a single persisted source
   of truth so the nav, auth screens and the accessibility panel all
   drive the same theme. Pages apply `isDark` to their root wrapper
   (which scopes the `.dark` design tokens).
   ───────────────────────────────────────────────────────────── */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeCtx = createContext<ThemeContextValue | null>(null);

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Brand default is dark; hydrated from storage after mount.
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    let saved: ThemeMode = "dark";
    try {
      const v = localStorage.getItem("oria-theme-mode");
      if (v === "light" || v === "dark" || v === "system") saved = v;
    } catch {
      /* ignore */
    }
    setModeState(saved);
  }, []);

  // Resolve the effective theme, tracking the OS when in "system".
  useEffect(() => {
    const resolve = () =>
      setIsDark(mode === "system" ? systemPrefersDark() : mode === "dark");
    resolve();
    if (mode === "system" && typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", resolve);
      return () => mq.removeEventListener("change", resolve);
    }
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem("oria-theme-mode", next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setMode(isDark ? "light" : "dark");
  }, [isDark, setMode]);

  return (
    <ThemeCtx.Provider value={{ mode, isDark, setMode, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme precisa estar dentro de <ThemeProvider>");
  return ctx;
}
