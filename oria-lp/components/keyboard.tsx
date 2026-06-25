"use client";

/* ─────────────────────────────────────────────────────────────
   ORIA — Keyboard navigation helpers
   Shared across the landing, login and signup screens:
   a window-level keydown hook, a "skip to content" link, a
   discoverable "?" trigger and the shortcuts help dialog.
   ───────────────────────────────────────────────────────────── */

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "./parts";
import { AccessibilityPanel } from "./accessibility";

/* Is the user currently typing into a form control? Letter/number
   shortcuts must stand down while a field is focused. */
export function isTypingTarget(el: EventTarget | null): boolean {
  const n = el as HTMLElement | null;
  if (!n || !n.tagName) return false;
  const tag = n.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    n.isContentEditable === true
  );
}

/* Bind a single window keydown listener that always runs the latest
   handler (kept fresh via a ref), so callers never deal with stale
   closures or re-binding on every render. */
export function useKeydown(handler: (e: KeyboardEvent) => void) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const fn = (e: KeyboardEvent) => ref.current(e);
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
}

/* Accessibility: lets keyboard / screen-reader users jump past the
   decorative header straight to the main content with the first Tab. */
export function SkipLink({
  targetId = "conteudo",
  children = "Pular para o conteúdo",
}: {
  targetId?: string;
  children?: React.ReactNode;
}) {
  return (
    <a href={`#${targetId}`} className="oria-skip-link">
      {children}
    </a>
  );
}

/* A single keycap. */
export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="oria-kbd">{children}</kbd>;
}

export interface Shortcut {
  keys: string[];
  label: string;
}
export interface ShortcutGroup {
  heading?: string;
  items: Shortcut[];
}

/* Floating, desktop-only "?" affordance that opens the shortcuts panel. */
export function ShortcutsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Acessibilidade e atalhos de teclado"
      title="Acessibilidade (?)"
      className="oria-fab oria-kbd-fab"
    >
      <Icon name="person-standing" size={23} color="currentColor" />
    </button>
  );
}

/* The shortcuts help dialog. */
export function ShortcutsOverlay({
  open,
  onClose,
  groups,
  title = "Acessibilidade",
}: {
  open: boolean;
  onClose: () => void;
  groups: ShortcutGroup[];
  title?: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [tab, setTab] = useState<"a11y" | "keys">("a11y");

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="oria-kbd-overlay" onClick={onClose} aria-hidden="true" />
      <div
        className="oria-kbd-panel"
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="oria-kbd-panel-head">
          <span className="oria-kbd-panel-title">{title}</span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="oria-kbd-close"
          >
            ✕
          </button>
        </div>

        <div className="oria-kbd-tabs" role="tablist" aria-label="Seções">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "a11y"}
            className="oria-kbd-tab"
            onClick={() => setTab("a11y")}
          >
            <Icon name="person-standing" size={15} color="currentColor" />
            Acessibilidade
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "keys"}
            className="oria-kbd-tab"
            onClick={() => setTab("keys")}
          >
            <Icon name="keyboard" size={15} color="currentColor" />
            Atalhos
          </button>
        </div>

        {tab === "a11y" ? (
          <AccessibilityPanel />
        ) : (
          <>
            <div className="oria-kbd-groups">
              {groups.map((g, gi) => (
                <div key={gi} className="oria-kbd-group">
                  {g.heading && (
                    <div className="oria-kbd-group-head">{g.heading}</div>
                  )}
                  {g.items.map((it, ii) => (
                    <div key={ii} className="oria-kbd-row">
                      <span className="oria-kbd-label">{it.label}</span>
                      <span className="oria-kbd-keys">
                        {it.keys.map((k, ki) => (
                          <Kbd key={ki}>{k}</Kbd>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="oria-kbd-foot">
              Pressione <Kbd>Esc</Kbd> para fechar
            </div>
          </>
        )}
      </div>
    </>
  );
}
