"use client";

import React from "react";
import {
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  Check,
  CircleHelp,
  Clock,
  FileCheck,
  Files,
  FileText,
  HeartPulse,
  History,
  Info,
  MessageCircle,
  Moon,
  Paperclip,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "arrow-up-right": ArrowUpRight,
  "bar-chart-3": BarChart3,
  "calendar-clock": CalendarClock,
  check: Check,
  "circle-help": CircleHelp,
  clock: Clock,
  "file-check": FileCheck,
  files: Files,
  "file-text": FileText,
  "heart-pulse": HeartPulse,
  history: History,
  info: Info,
  "message-circle": MessageCircle,
  moon: Moon,
  paperclip: Paperclip,
  send: Send,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  sparkle: Sparkles,
  stethoscope: Stethoscope,
  sun: Sun,
  "trending-up": TrendingUp,
  x: X,
};

export function Icon({
  name,
  size = 20,
  color = "currentColor",
  strokeWidth = 1.75,
  style = {},
}: {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}) {
  const LucideComponent = iconMap[name];
  if (!LucideComponent) return null;
  return (
    <span
      style={{ display: "inline-flex", width: size, height: size, ...style }}
      aria-hidden="true"
    >
      <LucideComponent
        size={size}
        color={color}
        strokeWidth={strokeWidth}
      />
    </span>
  );
}

/* ── Logo ──────────────────────────────────────────────────────────── */
export function Logo({
  tone = "light",
  size = 30,
  showMark = true,
  className = "",
  style = {},
}: {
  tone?: "light" | "primary" | "dark";
  size?: number;
  showMark?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const word =
    tone === "light"
      ? "var(--oria-light-base)"
      : tone === "primary"
        ? "var(--oria-primary)"
        : "var(--oria-dark-base)";
  const mark = tone === "light" ? "var(--oria-sage)" : "var(--oria-primary)";
  const u = size / 30;
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9 * u,
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: word,
        }}
      >
        oria
      </span>
      {showMark && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "flex-end",
            gap: 3 * u,
            color: mark,
          }}
        >
          <span
            style={{
              width: 11 * u,
              height: 26 * u,
              background: "currentColor",
              borderRadius: 999,
            }}
          />
          <span
            style={{
              width: 9 * u,
              height: 16 * u,
              background: "currentColor",
              borderRadius: 999,
              opacity: 0.82,
            }}
          />
        </span>
      )}
    </span>
  );
}

/* ── Button ────────────────────────────────────────────────────────── */
const buttonSizes = {
  sm: { padding: "10px 18px", fontSize: "var(--text-sm)" },
  md: { padding: "14px 24px", fontSize: "var(--text-base)" },
  lg: { padding: "16px 30px", fontSize: "var(--text-md)" },
} as const;

const buttonVariants = {
  primary: {
    background: "var(--oria-primary)",
    color: "#f4f2ee",
    border: "1px solid transparent",
    boxShadow: "var(--shadow-cta)",
  },
  secondary: {
    background: "transparent",
    color: "var(--text-primary)",
    border: "1px solid var(--border-default)",
    boxShadow: "none",
  },
  inverse: {
    background: "var(--oria-light-base)",
    color: "var(--oria-primary)",
    border: "1px solid transparent",
    boxShadow: "var(--shadow-card)",
  },
  ghost: {
    background: "transparent",
    color: "var(--accent)",
    border: "1px solid transparent",
    boxShadow: "none",
  },
} as const;

export function Button({
  variant = "primary",
  size = "md",
  children,
  iconLeft,
  iconRight,
  style = {},
  ...rest
}: {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  children: React.ReactNode;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: React.CSSProperties;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [hover, setHover] = React.useState(false);
  const base = buttonVariants[variant];
  const hoverStyle = hover
    ? variant === "primary"
      ? {
          transform: "translateY(-2px)",
          background: "var(--oria-primary-deep)",
          boxShadow: "var(--shadow-premium-hover)",
        }
      : { transform: "translateY(-2px)", background: "var(--accent-soft)" }
    : {};
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        borderRadius: "var(--radius-pill)",
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        letterSpacing: "0.01em",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition:
          "transform var(--dur-base) var(--ease-spring), box-shadow var(--dur-base) var(--ease-apple), background var(--dur-base) var(--ease-apple)",
        ...buttonSizes[size],
        ...base,
        ...hoverStyle,
        ...style,
      }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}

/* ── Badge ─────────────────────────────────────────────────────────── */
const badgeVariants = {
  mint: { background: "var(--oria-mint)", color: "var(--oria-primary)" },
  soft: { background: "var(--accent-soft)", color: "var(--accent)" },
  solid: { background: "var(--oria-primary)", color: "#f4f2ee" },
  onDark: {
    background: "rgba(106,138,122,0.16)",
    color: "var(--oria-sage)",
  },
} as const;

export function Badge({
  variant = "mint",
  children,
  style = {},
}: {
  variant?: keyof typeof badgeVariants;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 15px",
        borderRadius: "var(--radius-pill)",
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        letterSpacing: "var(--tracking-eyebrow)",
        textTransform: "uppercase",
        lineHeight: 1,
        whiteSpace: "nowrap",
        ...badgeVariants[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* ── Card ──────────────────────────────────────────────────────────── */
const cardTones = {
  surface: {
    background: "var(--bg-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "var(--shadow-card)",
  },
  dark: {
    background: "var(--oria-dark-surface)",
    color: "var(--oria-light-base)",
    border: "1px solid var(--border-strong)",
    boxShadow: "var(--shadow-glass)",
  },
  mint: {
    background: "var(--oria-mint-surface)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "none",
  },
} as const;

const glassStyle = {
  background: "var(--glass-bg)",
  WebkitBackdropFilter: "blur(var(--blur-glass))",
  backdropFilter: "blur(var(--blur-glass))",
  border: "1px solid var(--glass-border)",
  boxShadow: "var(--shadow-premium)",
  color: "var(--text-primary)",
} as const;

export function Card({
  tone = "surface",
  glass = false,
  interactive = false,
  radius = "lg",
  padding = "var(--space-6)",
  children,
  style = {},
  ...rest
}: {
  tone?: keyof typeof cardTones;
  glass?: boolean;
  interactive?: boolean;
  radius?: "sm" | "lg";
  padding?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const [hover, setHover] = React.useState(false);
  const b = glass ? glassStyle : cardTones[tone];
  return (
    <div
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
      style={{
        borderRadius:
          radius === "sm" ? "var(--radius-bento-sm)" : "var(--radius-bento-lg)",
        padding,
        transition:
          "transform var(--dur-base) var(--ease-spring), box-shadow var(--dur-base) var(--ease-apple)",
        ...b,
        ...(hover
          ? {
              transform: "translateY(-4px)",
              boxShadow: "var(--shadow-premium-hover)",
            }
          : {}),
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ── Eyebrow ───────────────────────────────────────────────────────── */
export function Eyebrow({
  children,
  color = "var(--text-muted)",
  style = {},
}: {
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        textTransform: "uppercase",
        letterSpacing: "var(--tracking-eyebrow)",
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        color,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
