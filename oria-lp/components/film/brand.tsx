"use client";

import React from "react";
import { clamp, Easing, useTime } from "./animations";

// ── Brand constants ───────────────────────────────────────────────────────
export const C = {
  base: "#111715",
  base2: "#0c1a15",
  surface: "#0b2e24",
  primary: "#1d4d3b",
  primaryDeep: "#0a3026",
  ink: "#143a30",
  sage: "#6a8a7a",
  muted: "#788171",
  light: "#f4f2ee",
  lightSurf: "#e7e2d8",
  mint: "#dce7dd",
  glow: "#9fe6bd",
} as const;

export const FD = '"Schibsted Grotesk", ui-sans-serif, system-ui, sans-serif';
export const FB = '"Hanken Grotesk", ui-sans-serif, system-ui, sans-serif';

// ── Helpers ───────────────────────────────────────────────────────────────
export function inout(
  localTime: number,
  duration: number,
  inDur = 0.6,
  outDur = 0.5,
  rise = 22
) {
  const exitStart = duration - outDur;
  if (localTime < inDur) {
    const t = Easing.easeOutCubic(clamp(localTime / inDur, 0, 1));
    return { o: t, y: (1 - t) * rise };
  }
  if (localTime > exitStart) {
    const t = Easing.easeInCubic(
      clamp((localTime - exitStart) / outDur, 0, 1)
    );
    return { o: 1 - t, y: -t * (rise * 0.5) };
  }
  return { o: 1, y: 0 };
}

// ── Primitives ────────────────────────────────────────────────────────────
export function Mark({
  size = 120,
  color = C.primary,
  opacity = 1,
  style = {},
}: {
  size?: number;
  color?: string;
  opacity?: number;
  style?: React.CSSProperties;
}) {
  const u = size / 120;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "flex-end",
        gap: 10 * u,
        opacity,
        ...style,
      }}
    >
      <div
        style={{
          width: 44 * u,
          height: 104 * u,
          background: color,
          borderRadius: 999,
        }}
      />
      <div
        style={{
          width: 36 * u,
          height: 64 * u,
          background: color,
          borderRadius: 999,
          opacity: 0.82,
        }}
      />
    </div>
  );
}

export function Wordmark({
  size = 96,
  color = C.light,
  mark = C.glow,
  gap = 0.34,
}: {
  size?: number;
  color?: string;
  mark?: string;
  gap?: number;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "flex-end",
        gap: size * gap,
      }}
    >
      <span
        style={{
          fontFamily: FD,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 0.9,
          letterSpacing: "-0.03em",
          color,
        }}
      >
        oria
      </span>
      <Mark
        size={size * 0.92}
        color={mark}
        style={{ marginBottom: size * 0.04 }}
      />
    </div>
  );
}

export function Caption({
  eyebrow,
  title,
  sub,
  localTime,
  duration,
  x = 120,
  y = 760,
  maxW = 880,
  align = "left",
  inDur = 0.6,
  outDur = 0.5,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  localTime: number;
  duration: number;
  x?: number;
  y?: number;
  maxW?: number;
  align?: "left" | "center" | "right";
  inDur?: number;
  outDur?: number;
}) {
  const a = inout(localTime, duration, inDur, outDur, 24);
  const aTitle = inout(localTime, duration, inDur + 0.12, outDur, 26);
  const aSub = inout(localTime, duration, inDur + 0.24, outDur, 22);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        maxWidth: maxW,
        textAlign: align,
      }}
    >
      {eyebrow && (
        <div
          style={{
            opacity: a.o,
            transform: `translateY(${a.y}px)`,
            fontFamily: FD,
            textTransform: "uppercase",
            letterSpacing: "0.26em",
            fontSize: 22,
            fontWeight: 700,
            color: C.sage,
            marginBottom: 22,
          }}
        >
          {eyebrow}
        </div>
      )}
      <div
        style={{
          opacity: aTitle.o,
          transform: `translateY(${aTitle.y}px)`,
          fontFamily: FD,
          fontWeight: 700,
          fontSize: 76,
          lineHeight: 1.04,
          letterSpacing: "-0.02em",
          color: C.light,
          textWrap: "balance",
        }}
      >
        {title}
      </div>
      {sub && (
        <div
          style={{
            opacity: aSub.o,
            transform: `translateY(${aSub.y}px)`,
            fontFamily: FB,
            fontSize: 30,
            lineHeight: 1.5,
            color: "rgba(244,242,238,0.72)",
            marginTop: 24,
            maxWidth: maxW * 0.82,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export function FileGlyph({
  size = 34,
  color = C.primary,
  bg = "rgba(29,77,59,0.12)",
}: {
  size?: number;
  color?: string;
  bg?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: bg,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M14 3v5h5"
          stroke={color}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Backdrop({ duration }: { duration: number }) {
  const t = useTime();
  const breathe = 1 + 0.07 * Math.sin(t * 0.55);
  const breathe2 = 1 + 0.06 * Math.sin(t * 0.4 + 2);
  const drift = Math.sin(t * 0.22) * 14;

  const paths = [
    "M-60 760 C 360 740, 640 360, 1020 400 S 1680 800, 1990 360",
    "M-60 880 C 440 860, 740 520, 1120 540 S 1740 920, 1990 560",
  ];

  const phase = (n: number) => ((t * 0.16 + n * 0.35) % 1);
  const offset = (n: number) => 1100 - phase(n) * 1260;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -260,
          right: -160,
          width: 900,
          height: 900,
          borderTopLeftRadius: "50%",
          borderTopRightRadius: "50%",
          borderBottomRightRadius: "50%",
          borderBottomLeftRadius: "50%",
          backgroundImage:
            "radial-gradient(circle, rgba(106,138,122,0.30), transparent 68%)",
          transform: `scale(${breathe})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -320,
          left: -200,
          width: 820,
          height: 820,
          borderTopLeftRadius: "50%",
          borderTopRightRadius: "50%",
          borderBottomRightRadius: "50%",
          borderBottomLeftRadius: "50%",
          backgroundImage:
            "radial-gradient(circle, rgba(29,77,59,0.42), transparent 70%)",
          transform: `scale(${breathe2})`,
        }}
      />
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        fill="none"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          transform: `translateY(${drift}px)`,
        }}
      >
        <defs>
          <filter
            id="bd-glow"
            x="-10%"
            y="-60%"
            width="120%"
            height="220%"
          >
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        {paths.map((d, i) => (
          <path
            key={"b" + i}
            d={d}
            stroke={C.sage}
            strokeWidth={i === 0 ? 2 : 1.4}
            opacity={i === 0 ? 0.26 : 0.16}
          />
        ))}
        {paths.map((d, i) => (
          <g key={"g" + i}>
            <path
              d={d}
              pathLength="1000"
              stroke={C.glow}
              strokeWidth={i === 0 ? 6 : 4}
              strokeLinecap="round"
              filter="url(#bd-glow)"
              strokeDasharray="90 1000"
              strokeDashoffset={offset(i)}
              opacity={0.5}
            />
            <path
              d={d}
              pathLength="1000"
              stroke={C.glow}
              strokeWidth={i === 0 ? 2 : 1.5}
              strokeLinecap="round"
              strokeDasharray="90 1000"
              strokeDashoffset={offset(i)}
              opacity={0.9}
            />
          </g>
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundImage:
            "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(8,12,10,0.55) 100%)",
        }}
      />
    </div>
  );
}
