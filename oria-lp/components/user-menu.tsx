"use client";

import React, { useRef, useEffect, useState } from "react";
import { Icon, Logo } from "./parts";

/* ── UserMenu ─────────────────────────────────────────────────────────────
   Botão incorporado à navbar com dropdown convidativo.
   Efeitos de brilho verde para incentivar o cadastro.
──────────────────────────────────────────────────────────────────────────── */

interface UserMenuProps {
  theme: "dark" | "light";
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export function UserMenu({ theme, onLoginClick, onSignupClick }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const exitAnimRef = useRef<NodeJS.Timeout | null>(null);

  const closeMenu = () => {
    if (exiting) return;
    setExiting(true);
    exitAnimRef.current = setTimeout(() => {
      setOpen(false);
      setExiting(false);
      exitAnimRef.current = null;
    }, 250);
  };

  // Fechar com delay para permitir movimento suave entre botão e dropdown
  useEffect(() => {
    if (isHovered || isMenuHovered) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      if (exitAnimRef.current && open) {
        clearTimeout(exitAnimRef.current);
        exitAnimRef.current = null;
        setExiting(false);
      }
    } else if (open && !closeTimeoutRef.current && !exiting) {
      closeTimeoutRef.current = setTimeout(() => {
        closeMenu();
        closeTimeoutRef.current = null;
      }, 300);
    }

    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isHovered, isMenuHovered, open, exiting]);

  // Fechar dropdown ao pressionar Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, exiting]);

  // Recalcular posição do dropdown e botão ao abrir
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect(rect);
    }
  }, [open]);

  // Limpar timeout de animação ao desmontar
  useEffect(() => {
    return () => {
      if (exitAnimRef.current) {
        clearTimeout(exitAnimRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Botão em bolha separada ao lado da navbar */}
      <div
        className="oria-cta-in"
        style={{
          display: "inline-flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <button
          ref={buttonRef}
          onMouseEnter={() => {
            setIsHovered(true);
            setOpen(true);
          }}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Menu de conta"
          aria-expanded={open}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isHovered ? 10 : 0,
            background: isHovered || open ? "linear-gradient(135deg, var(--oria-primary), var(--oria-primary-deep))" : "var(--glass-bg)",
            color: isHovered || open ? "#f4f2ee" : "var(--text-secondary)",
            border: `1px solid ${isHovered || open ? "var(--oria-primary)" : "var(--glass-border)"}`,
            borderRadius: 999,
            width: isHovered ? 144 : 42,
            height: 42,
            cursor: "pointer",
            boxShadow: isHovered || open
              ? "0 8px 32px rgba(106, 138, 122, 0.4), 0 0 0 3px rgba(106, 138, 122, 0.2)"
              : "0 4px 16px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(106, 138, 122, 0.05)",
            WebkitBackdropFilter: "blur(var(--blur-glass))",
            backdropFilter: "blur(var(--blur-glass))",
            transition: "all 0.4s var(--ease-spring)",
          }}
        >
          <Icon name="user-round" size={20} color="currentColor" />
          {isHovered && (
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
                opacity: 0,
                animation: "fade-in 0.3s ease-out 0.1s forwards",
              }}
            >
              Entrar
            </span>
          )}
        </button>
      </div>

      {/* Área bridge invisível para preencher gap entre botão e dropdown */}
      {(open || exiting) && buttonRect && (
        <div
          onMouseEnter={() => setIsMenuHovered(true)}
          onMouseLeave={() => setIsMenuHovered(false)}
          style={{
            position: "fixed",
            top: buttonRect.bottom,
            left: buttonRect.left,
            width: buttonRect.width || 160,
            height: 8,
            pointerEvents: "auto",
            zIndex: 99,
          }}
        />
      )}

      {/* Dropdown */}
      {(open || exiting) && buttonRect && (
        <div
          ref={menuRef}
          onMouseEnter={() => setIsMenuHovered(true)}
          onMouseLeave={() => setIsMenuHovered(false)}
          style={{
            position: "fixed",
            top: buttonRect.bottom + 8,
            left: Math.max(
              8,
              Math.min(
                buttonRect.left + buttonRect.width / 2 - 140,
                (typeof window !== "undefined" ? window.innerWidth : 9999) - 280 - 8,
              ),
            ),
            width: 280,
            borderRadius: 16,
            background: "var(--bg-elevated)",
            WebkitBackdropFilter: "blur(20px)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--border-default)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(106, 138, 122, 0.1)",
            padding: "12px",
            zIndex: 100,
            animation: exiting
              ? "user-menu-leave 0.25s var(--ease-apple) forwards"
              : "user-menu-enter 0.3s var(--ease-spring) both",
          }}
        >
          {/* Header do dropdown com logo e mensagem convidativa */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 16px",
              borderBottom: "1px solid var(--border-subtle)",
              marginBottom: 10,
              background: "linear-gradient(135deg, rgba(106, 138, 122, 0.08), transparent)",
              borderRadius: 12,
            }}
          >
            <Logo tone={theme === "dark" ? "light" : "primary"} size={20} />
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--text-primary)",
                }}
              >
                ORIA
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                Sua saúde em clareza
              </span>
            </div>
          </div>

          {/* Opções do menu com efeito de brilho */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <MenuButton
              onClick={() => {
                closeMenu();
                onLoginClick();
              }}
              icon="log-in"
              label="Entrar"
              description="Acessar sua conta"
              theme={theme}
            />

            <MenuButton
              onClick={() => {
                closeMenu();
                onSignupClick();
              }}
              icon="user"
              label="Criar conta"
              description="Comece gratuitamente"
              theme={theme}
              highlight // Destaque para convidar ao cadastro
            />
          </div>

          {/* Footer do dropdown */}
          <div
            style={{
              marginTop: 12,
              padding: "10px 16px",
              borderTop: "1px solid var(--border-subtle)",
              fontSize: 11.5,
              color: "var(--text-muted)",
              lineHeight: 1.4,
              textAlign: "center",
              background: "rgba(106, 138, 122, 0.05)",
              borderRadius: 10,
            }}
          >
            🌿 Junte-se a nós e transforme seus exames em clareza
          </div>
        </div>
      )}

      {/* CSS para animações */}
      <style jsx global>{`
        @keyframes user-menu-enter {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes user-menu-leave {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
        }

        @keyframes green-shimmer {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(106, 138, 122, 0.4);
          }
          50% {
            box-shadow: 0 0 20px 4px rgba(106, 138, 122, 0.6);
          }
        }

        @keyframes shimmer-sweep {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}

/* ── MenuButton com efeito de brilho verde ─────────────────────────────── */
interface MenuButtonProps {
  onClick: () => void;
  icon: string;
  label: string;
  description: string;
  theme: "dark" | "light";
  highlight?: boolean;
}

function MenuButton({ onClick, icon, label, description, theme, highlight }: MenuButtonProps) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        padding: "14px 16px",
        borderRadius: 12,
        background: highlight
          ? hover
            ? "linear-gradient(135deg, rgba(106, 138, 122, 0.2), rgba(106, 138, 122, 0.12))"
            : "linear-gradient(135deg, rgba(106, 138, 122, 0.15), rgba(106, 138, 122, 0.08))"
          : "transparent",
        border: highlight ? "1px solid rgba(106, 138, 122, 0.3)" : "1px solid transparent",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "var(--font-body)",
        fontSize: 14,
        fontWeight: highlight ? 600 : 500,
        color: "var(--text-primary)",
        transition: "all 0.2s var(--ease-apple)",
        position: "relative",
        overflow: "hidden",
        ...(hover
          ? {
              transform: "translateX(4px)",
              boxShadow: highlight
                ? "0 4px 20px rgba(106, 138, 122, 0.3)"
                : "none",
            }
          : {}),
      }}
    >
      {/* Efeito de brilho verde ao hover */}
      {hover && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, transparent, rgba(159, 230, 189, 0.15), transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer-sweep 1.5s ease-in-out",
            borderRadius: 12,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Ícone com brilho */}
      <span
        style={{
          position: "relative",
          width: 38,
          height: 38,
          borderRadius: 10,
          background: highlight
            ? "var(--oria-primary)"
            : "var(--accent-soft)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s var(--ease-spring)",
          ...(hover && highlight
            ? {
                animation: "green-shimmer 1.5s ease-in-out infinite",
                transform: "scale(1.1)",
              }
            : {}),
        }}
      >
        <Icon
          name={icon as any}
          size={18}
          color={highlight ? "#f4f2ee" : "var(--oria-sage)"}
        />
      </span>

      {/* Texto */}
      <span style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontWeight: highlight ? 600 : 500,
            fontSize: 14,
            color: "var(--text-primary)",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: 1,
          }}
        >
          {description}
        </div>
      </span>
    </button>
  );
}
