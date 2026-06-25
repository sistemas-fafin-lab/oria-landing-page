"use client";

/* ─────────────────────────────────────────────────────────────
   ORIA — Accessibility preferences
   A small global store (persisted to localStorage and reflected
   onto <html> data-* attributes so CSS can react) plus the panel
   rendered inside the floating accessibility dialog.

   Preferences:
   • shortcutsEnabled — gate for the keyboard shortcuts (default OFF,
     per WCAG 2.1.4 "Character Key Shortcuts").
   • fontSize         — root type scale (rem-based tokens).
   • highContrast     — stronger text/border contrast.
   • reducedMotion    — opt-in to silence animations/transitions.
   ───────────────────────────────────────────────────────────── */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Icon } from "./parts";
import { useTheme, type ThemeMode } from "./theme";

export const FONT_SIZES = ["small", "medium", "large", "extra-large"] as const;
export type FontSize = (typeof FONT_SIZES)[number];

const FONT_LABEL: Record<FontSize, string> = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
  "extra-large": "Extra grande",
};

interface A11yContextValue {
  shortcutsEnabled: boolean;
  toggleShortcuts: () => void;
  fontSize: FontSize;
  fontLabel: string;
  increaseFont: () => void;
  decreaseFont: () => void;
  resetFont: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
}

const A11yCtx = createContext<A11yContextValue | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [shortcutsEnabled, setShortcutsEnabled] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Hydrate stored prefs after mount (keeps SSR markup stable).
  useEffect(() => {
    setShortcutsEnabled(read("oria-a11y-shortcuts", false));
    setFontSize(read<FontSize>("oria-a11y-font", "medium"));
    setHighContrast(read("oria-a11y-contrast", false));
    setReducedMotion(read("oria-a11y-motion", false));
  }, []);

  // Reflect prefs onto <html> so global CSS can react.
  useEffect(() => {
    const el = document.documentElement;
    if (fontSize === "medium") el.removeAttribute("data-font-size");
    else el.setAttribute("data-font-size", fontSize);
  }, [fontSize]);
  useEffect(() => {
    const el = document.documentElement;
    if (highContrast) el.setAttribute("data-high-contrast", "true");
    else el.removeAttribute("data-high-contrast");
  }, [highContrast]);
  useEffect(() => {
    const el = document.documentElement;
    if (reducedMotion) el.setAttribute("data-reduced-motion", "true");
    else el.removeAttribute("data-reduced-motion");
  }, [reducedMotion]);

  const toggleShortcuts = useCallback(() => {
    setShortcutsEnabled((v) => {
      write("oria-a11y-shortcuts", !v);
      return !v;
    });
  }, []);
  const toggleHighContrast = useCallback(() => {
    setHighContrast((v) => {
      write("oria-a11y-contrast", !v);
      return !v;
    });
  }, []);
  const toggleReducedMotion = useCallback(() => {
    setReducedMotion((v) => {
      write("oria-a11y-motion", !v);
      return !v;
    });
  }, []);
  const increaseFont = useCallback(() => {
    setFontSize((cur) => {
      const i = FONT_SIZES.indexOf(cur);
      const next = i < FONT_SIZES.length - 1 ? FONT_SIZES[i + 1] : cur;
      write("oria-a11y-font", next);
      return next;
    });
  }, []);
  const decreaseFont = useCallback(() => {
    setFontSize((cur) => {
      const i = FONT_SIZES.indexOf(cur);
      const prev = i > 0 ? FONT_SIZES[i - 1] : cur;
      write("oria-a11y-font", prev);
      return prev;
    });
  }, []);
  const resetFont = useCallback(() => {
    setFontSize("medium");
    write("oria-a11y-font", "medium");
  }, []);

  return (
    <A11yCtx.Provider
      value={{
        shortcutsEnabled,
        toggleShortcuts,
        fontSize,
        fontLabel: FONT_LABEL[fontSize],
        increaseFont,
        decreaseFont,
        resetFont,
        highContrast,
        toggleHighContrast,
        reducedMotion,
        toggleReducedMotion,
      }}
    >
      {children}
    </A11yCtx.Provider>
  );
}

export function useAccessibility(): A11yContextValue {
  const ctx = useContext(A11yCtx);
  if (!ctx)
    throw new Error(
      "useAccessibility precisa estar dentro de <AccessibilityProvider>",
    );
  return ctx;
}

/* ── A labelled on/off switch row ───────────────────────────── */
function SwitchRow({
  icon,
  title,
  desc,
  checked,
  onToggle,
}: {
  icon: string;
  title: string;
  desc: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="oria-a11y-block">
      <span className="oria-a11y-ic">
        <Icon name={icon} size={16} color="var(--accent)" />
      </span>
      <div className="oria-a11y-text">
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={onToggle}
        className="oria-a11y-switch"
      >
        <span className="oria-a11y-knob" />
      </button>
    </div>
  );
}

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: "light", label: "Claro", icon: "sun" },
  { mode: "dark", label: "Escuro", icon: "moon" },
  { mode: "system", label: "Sistema", icon: "monitor" },
];

/* ── Accessibility tab content ──────────────────────────────── */
export function AccessibilityPanel() {
  const a = useAccessibility();
  const t = useTheme();
  return (
    <div className="oria-a11y">
      <div className="oria-a11y-block oria-a11y-block-col">
        <div className="oria-a11y-block-head">
          <span className="oria-a11y-ic">
            <Icon
              name={t.isDark ? "moon" : "sun"}
              size={16}
              color="var(--accent)"
            />
          </span>
          <div className="oria-a11y-text">
            <strong>Tema</strong>
            <span>Claro, escuro ou seguir o sistema.</span>
          </div>
        </div>
        <div className="oria-a11y-seg" role="group" aria-label="Tema">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.mode}
              type="button"
              aria-pressed={t.mode === opt.mode}
              className="oria-a11y-seg-btn"
              onClick={() => t.setMode(opt.mode)}
            >
              <Icon name={opt.icon} size={15} color="currentColor" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <SwitchRow
        icon="keyboard"
        title="Atalhos de teclado"
        desc="Navegue e aja com teclas de atalho."
        checked={a.shortcutsEnabled}
        onToggle={a.toggleShortcuts}
      />

      <div className="oria-a11y-block oria-a11y-block-col">
        <div className="oria-a11y-block-head">
          <span className="oria-a11y-ic">
            <Icon name="type" size={16} color="var(--accent)" />
          </span>
          <div className="oria-a11y-text">
            <strong>Tamanho da fonte</strong>
            <span>Ajuste a escala do texto.</span>
          </div>
        </div>
        <div className="oria-a11y-stepper">
          <button
            type="button"
            onClick={a.decreaseFont}
            disabled={a.fontSize === "small"}
            aria-label="Diminuir fonte"
            className="oria-a11y-step"
          >
            <Icon name="minus" size={16} color="currentColor" />
          </button>
          <button
            type="button"
            onClick={a.resetFont}
            aria-label="Restaurar tamanho padrão"
            className="oria-a11y-reset"
          >
            <Icon name="rotate-ccw" size={14} color="currentColor" />
            {a.fontLabel}
          </button>
          <button
            type="button"
            onClick={a.increaseFont}
            disabled={a.fontSize === "extra-large"}
            aria-label="Aumentar fonte"
            className="oria-a11y-step"
          >
            <Icon name="plus" size={16} color="currentColor" />
          </button>
        </div>
      </div>

      <SwitchRow
        icon="eye"
        title="Alto contraste"
        desc="Realça texto e bordas — ideal para baixa visão."
        checked={a.highContrast}
        onToggle={a.toggleHighContrast}
      />
      <SwitchRow
        icon="sparkles"
        title="Reduzir movimento"
        desc="Minimiza animações e transições."
        checked={a.reducedMotion}
        onToggle={a.toggleReducedMotion}
      />

      <p className="oria-a11y-note">
        Preferências salvas automaticamente neste dispositivo.
      </p>
    </div>
  );
}
