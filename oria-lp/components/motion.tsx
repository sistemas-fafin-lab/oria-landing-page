"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";

/* Scroll progress CSS var publisher */
function useScrollProgressVar() {
  useEffect(() => {
    let raf = 0;
    function update() {
      const root = document.documentElement;
      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      root.style.setProperty("--oria-scroll", p.toFixed(4));
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    if (document.readyState !== "loading") update();
    else document.addEventListener("DOMContentLoaded", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
}

/* ── useReducedMotion ─────────────────────────────────────────────── */
export function useReducedMotion() {
  const [r, setR] = useState(() =>
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    if (typeof matchMedia === "undefined") return;
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setR(mq.matches);
    mq.addEventListener ? mq.addEventListener("change", on) : mq.addListener(on);
    return () =>
      mq.removeEventListener
        ? mq.removeEventListener("change", on)
        : mq.removeListener(on);
  }, []);
  return r;
}

/* ── useReveal ────────────────────────────────────────────────────── */
export function useReveal({
  threshold = 0.18,
  rootMargin = "0px 0px -8% 0px",
}: {
  threshold?: number;
  rootMargin?: string;
} = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const inView = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      return r.top < vh * 0.92 && r.bottom > 0;
    };
    if (inView()) { setVisible(true); return; }
    let done = false;
    let io: IntersectionObserver | null = null;
    const reveal = () => {
      if (done) return;
      done = true;
      setVisible(true);
      if (io) io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    const onScroll = () => { if (inView()) reveal(); };
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) reveal();
        },
        { threshold, rootMargin }
      );
      io.observe(el);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (io) io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return [ref, visible] as const;
}

/* ── Reveal ────────────────────────────────────────────────────────── */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  appear = false,
  threshold,
  style = {},
  className,
  ...rest
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  appear?: boolean;
  threshold?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [ref, vis] = useReveal({ threshold });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!appear) return;
    const id = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(id);
  }, [appear]);
  const shown = reduced ? true : appear ? mounted : vis;
  return (
    <div
      ref={appear ? undefined : ref}
      className={className}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : `translate3d(0, ${y}px, 0)`,
        transition: reduced
          ? "none"
          : `opacity 0.72s var(--ease-out) ${delay}ms, transform 0.84s var(--ease-out) ${delay}ms`,
        willChange: "opacity, transform",
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ── useCountUp ────────────────────────────────────────────────────── */
export function useCountUp(target: number, active: boolean, dur = 1150) {
  const reduced = useReducedMotion();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (reduced) { setVal(target); return; }
    let raf: number;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, reduced, dur]);
  return val;
}

/* ── useTrack ──────────────────────────────────────────────────────── */
export function useTrack() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null) as React.RefObject<HTMLElement>;
  const [p, setP] = useState(0);
  useEffect(() => {
    if (reduced) { setP(0.5); return; }
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const total = r.height + vh;
      const prog = (vh - r.top) / total;
      setP(Math.min(1, Math.max(0, prog)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);
  return [ref, p] as const;
}

/* ── useMouseParallax ──────────────────────────────────────────────── */
export function useMouseParallax(intensity = 0.015) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      if (raf) return;
      const cx = e.clientX;
      const cy = e.clientY;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const x = ((cx - r.left) / r.width - 0.5) * 2;
        const y = ((cy - r.top) / r.height - 0.5) * 2;
        setOffset({ x: x * intensity, y: y * intensity });
      });
    };
    const onLeave = () => setOffset({ x: 0, y: 0 });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [intensity]);
  return [ref, offset] as const;
}

/* ── LivingLines ────────────────────────────────────────────────────── */
export function LivingLines({
  opacity = 0.4,
  tone = "dark",
}: {
  opacity?: number;
  tone?: "dark" | "light";
}) {
  const reduced = useReducedMotion();
  const [ref, p] = useTrack();
  const startP = useRef(-1);
  if (startP.current < 0 && p > 0.01) {
    startP.current = p;
  }
  const p0 = startP.current > 0 ? startP.current : 0.5;
  const range = 1 - p0;
  const effectiveP =
    range > 0.001 ? Math.max(0, Math.min(1, (p - p0) / range)) : 0;
  const idRef = useRef<string | null>(null);
  const reactId = useId();
  if (idRef.current === null) idRef.current = reactId.replace(/:/g, "");
  const id = idRef.current!;

  const paths = [
    "M-20 380 C 300 380, 420 140, 720 170 S 1180 420, 1460 150",
    "M-20 440 C 340 420, 500 240, 780 250 S 1220 480, 1460 240",
  ];
  const baseStroke =
    tone === "light"
      ? "var(--living-lines-base-light, #bfe0cb)"
      : "var(--living-lines-base, #6a8a7a)";
  const glowStroke =
    tone === "light"
      ? "var(--living-lines-glow-light, #eafaf0)"
      : "var(--living-lines-glow, #9fe6bd)";
  const glowOpacity = tone === "light" ? 0.55 : 0.7;
  const offset = 1070 - effectiveP * 930;

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        pointerEvents: "none",
      }}
    >
      <svg
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <filter id={`${id}-glow`} x="-10%" y="-60%" width="120%" height="220%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        {paths.map((d, i) => (
          <path
            key={"b" + i}
            d={d}
            stroke={baseStroke}
            strokeWidth={i === 0 ? 1.5 : 1}
            opacity={i === 0 ? opacity : opacity * 0.6}
          />
        ))}
        {!reduced &&
          paths.map((d, i) => (
            <g key={"g" + i} className="oria-line-breathe">
              <path
                d={d}
                pathLength="1000"
                stroke={glowStroke}
                strokeWidth={i === 0 ? 5 : 3.5}
                strokeLinecap="round"
                filter={`url(#${id}-glow)`}
                strokeDasharray="70 1000"
                strokeDashoffset={offset}
                opacity={glowOpacity}
              />
              <path
                d={d}
                pathLength="1000"
                stroke={glowStroke}
                strokeWidth={i === 0 ? 1.6 : 1.2}
                strokeLinecap="round"
                strokeDasharray="70 1000"
                strokeDashoffset={offset}
                opacity={Math.min(glowOpacity * 1.45, 1)}
              />
            </g>
          ))}
      </svg>
    </div>
  );
}
