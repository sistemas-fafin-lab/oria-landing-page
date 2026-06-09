"use client";

import React from "react";
import { Easing, clamp, Stage, Sprite, useSprite, useTimeline, useTime } from "./animations";
import { C, FD, FB, inout, Mark } from "./brand";
import { SceneProblem, SceneSend, SceneProcess, SceneReceive, SceneClose } from "./scenes";
import { Backdrop } from "./brand";

const FILM_DUR = 29.5;
const SCENE_OFFSET = 3.5;

/* ── Welcome scene (t = 0 → 3.5s) ──────────────────────────────────────── */
function SceneWelcome() {
  const { localTime, duration } = useSprite();
  const a = inout(localTime, duration, 0.55, 0.65, 30);
  const markIn = Easing.easeOutBack(clamp(localTime / 0.65, 0, 1));
  const subIn = Easing.easeOutCubic(
    clamp((localTime - 0.9) / 0.55, 0, 1)
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
      }}
    >
      <div
        style={{
          opacity: a.o,
          transform: `scale(${markIn}) translateY(${a.y * 0.4}px)`,
          transformOrigin: "center",
        }}
      >
        <Mark size={88} color={C.glow} />
      </div>

      <div style={{ textAlign: "center" }}>
        <div
          style={{
            opacity: a.o,
            transform: `translateY(${a.y}px)`,
            fontFamily: FD,
            fontWeight: 700,
            fontSize: 94,
            letterSpacing: "-0.025em",
            lineHeight: 1.02,
            color: C.light,
          }}
        >
          Bem-vindo ao ORIA.
        </div>
        <div
          style={{
            opacity: a.o * subIn,
            transform: `translateY(${a.y * 0.55}px)`,
            fontFamily: FB,
            fontSize: 30,
            lineHeight: 1.5,
            color: "rgba(244,242,238,0.62)",
            marginTop: 22,
            letterSpacing: "0.01em",
          }}
        >
          Sua saúde com clareza, contexto e continuidade.
        </div>
      </div>
    </div>
  );
}

/* ── Playback control button ──────────────────────────────────────────────── */
function CtrlBtn({
  onClick,
  primary,
  label,
  children,
}: {
  onClick: () => void;
  primary?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: primary ? 36 : 28,
        height: primary ? 36 : 28,
        borderRadius: 999,
        border: primary
          ? "none"
          : "1px solid rgba(106,138,122,0.30)",
        background: primary
          ? hov
            ? C.glow
            : C.sage
          : hov
            ? "rgba(106,138,122,0.22)"
            : "rgba(244,242,238,0.07)",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "background 0.18s, transform 0.15s",
        transform: hov ? "scale(1.1)" : "scale(1)",
        transformOrigin: "center",
      }}
    >
      {children}
    </button>
  );
}

/* ── Playback controls bar ────────────────────────────────────────────────── */
function FilmControls() {
  const { time, duration, playing, setTime, setPlaying } =
    useTimeline();
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [dragging, setDrag] = React.useState(false);
  const [hovCtrl, setHovCtrl] = React.useState(false);
  const progress = duration > 0 ? time / duration : 0;

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${m}:${ss.toString().padStart(2, "0")}`;
  };

  const seekFrom = (
    e: React.MouseEvent | MouseEvent
  ) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const f = Math.max(
      0,
      Math.min(1, (e.clientX - r.left) / r.width)
    );
    setTime(f * duration);
  };

  React.useEffect(() => {
    if (!dragging) return;
    const mv = (e: MouseEvent) => seekFrom(e);
    const up = () => setDrag(false);
    window.addEventListener("mousemove", mv);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", mv);
      window.removeEventListener("mouseup", up);
    };
  }, [dragging, duration]);

  const show = hovCtrl || dragging;

  return (
    <div
      onMouseEnter={() => setHovCtrl(true)}
      onMouseLeave={() => setHovCtrl(false)}
      style={{
        position: "absolute",
        bottom: 32,
        left: 0,
        right: 0,
        height: 56,
        background:
          "linear-gradient(to top, rgba(5,10,8,0.96) 0%, rgba(5,10,8,0.65) 52%, transparent 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 72px 10px",
        userSelect: "none",
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(6px)",
        transition:
          "opacity 0.40s cubic-bezier(0.16,1,0.3,1), transform 0.40s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div
        ref={trackRef}
        onMouseDown={(e) => {
          setDrag(true);
          seekFrom(e);
        }}
        style={{
          width: 440,
          maxWidth: "calc(100% - 144px)",
          height: hovCtrl || dragging ? 4 : 3,
          borderRadius: 999,
          background: "rgba(244,242,238,0.16)",
          cursor: "pointer",
          position: "relative",
          marginBottom: 10,
          transition:
            "height 0.18s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progress * 100}%`,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${C.sage}, ${C.glow})`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: `${progress * 100}%`,
            transform: "translate(-50%, -50%)",
            width: 11,
            height: 11,
            borderRadius: 999,
            background: C.light,
            boxShadow: `0 0 9px ${C.glow}`,
            opacity: hovCtrl || dragging ? 1 : 0,
            transition: "opacity 0.20s",
            pointerEvents: "none",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          maxWidth: 320,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <CtrlBtn
          label="Reiniciar"
          onClick={() => {
            setTime(0);
            setPlaying(true);
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7 4v16"
              stroke={C.light}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path d="M7 12L18 5v14L7 12z" fill={C.light} />
          </svg>
        </CtrlBtn>

        <CtrlBtn
          label={playing ? "Pausar" : "Reproduzir"}
          primary
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <rect
                x="6"
                y="4"
                width="4"
                height="16"
                rx="1.5"
                fill={C.primary}
              />
              <rect
                x="14"
                y="4"
                width="4"
                height="16"
                rx="1.5"
                fill={C.primary}
              />
            </svg>
          ) : (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M8 5.14v14l11-7-11-7z"
                fill={C.primary}
              />
            </svg>
          )}
        </CtrlBtn>

        <CtrlBtn
          label="Avançar 10 segundos"
          onClick={() =>
            setTime((t) => Math.min(t + 10, duration))
          }
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 5l10 7-10 7V5z"
              fill={C.light}
            />
            <path
              d="M19 5v14"
              stroke={C.light}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </CtrlBtn>

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontFamily: FB,
            fontSize: 14,
            letterSpacing: "0.03em",
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: C.light }}>{fmt(time)}</span>
          <span style={{ color: "rgba(244,242,238,0.40)" }}>
            {" "}
            / {fmt(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Auto-starter ──────────────────────────────────────────────────────── */
function AutoStarter() {
  const { setTime, setPlaying } = useTimeline();
  React.useEffect(() => {
    setTime(0);
    setPlaying(true);
  }, []);
  return null;
}

/* ── Film composition ──────────────────────────────────────────────────── */
export function Film({
  startOnMount = false,
  inline = false,
}: {
  startOnMount?: boolean;
  inline?: boolean;
}) {
  const O = SCENE_OFFSET;
  return (
    <Stage
      width={1920}
      height={1080}
      duration={FILM_DUR}
      fps={60}
      immersive={!inline}
      hideBar={inline}
      autoplay={false}
      loop={true}
      persistKey="oria-film"
      background="linear-gradient(170deg, #0e1513 0%, #111715 42%, #0b1712 100%)"
    >
      <Backdrop duration={FILM_DUR} />

      <Sprite start={0} end={O}>
        <SceneWelcome />
      </Sprite>

      <Sprite start={O} end={O + 5.2}>
        <SceneProblem />
      </Sprite>
      <Sprite start={O + 5.2} end={O + 10.0}>
        <SceneSend />
      </Sprite>
      <Sprite start={O + 10.0} end={O + 14.4}>
        <SceneProcess />
      </Sprite>
      <Sprite start={O + 14.4} end={O + 20.0}>
        <SceneReceive />
      </Sprite>
      <Sprite start={O + 20.0} end={FILM_DUR}>
        <SceneClose />
      </Sprite>

      {startOnMount && <AutoStarter />}

      <FilmControls />
    </Stage>
  );
}

/* ── Circular-reveal overlay ───────────────────────────────────────────── */
export function FilmOverlay({
  open,
  onClose,
  originX,
  originY,
}: {
  open: boolean;
  onClose: () => void;
  originX?: number | null;
  originY?: number | null;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      try {
        localStorage.removeItem("oria-film:t");
      } catch {}
      setMounted(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setExpanded(true))
      );
    } else {
      setExpanded(false);
      const id = setTimeout(() => setMounted(false), 700);
      return () => clearTimeout(id);
    }
  }, [open]);

  React.useEffect(() => {
    document.body.style.overflow = mounted ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted]);

  if (!mounted) return null;

  const ox =
    originX != null ? originX : window.innerWidth - 80;
  const oy =
    originY != null ? originY : window.innerHeight / 2;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Filme da marca ORIA"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "#0a0a0a",
        clipPath: expanded
          ? `circle(200vmax at ${ox}px ${oy}px)`
          : `circle(36px   at ${ox}px ${oy}px)`,
        transition: expanded
          ? "clip-path 1.10s cubic-bezier(0.16, 1, 0.3, 1)"
          : "clip-path 0.58s cubic-bezier(0.25, 0.1, 0.25, 1)",
      }}
    >
      <Film />

      <button
        onClick={onClose}
        aria-label="Fechar filme"
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 10,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 18px 10px 14px",
          background: "rgba(11, 46, 36, 0.55)",
          WebkitBackdropFilter: "blur(16px)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(106, 138, 122, 0.28)",
          borderRadius: 999,
          color: "#f4f2ee",
          fontFamily:
            '"Hanken Grotesk", ui-sans-serif, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: 14,
          letterSpacing: "0.01em",
          cursor: "pointer",
          opacity: expanded ? 1 : 0,
          transform: expanded
            ? "translateY(0)"
            : "translateY(-10px)",
          transition: expanded
            ? "opacity 0.30s 0.88s, transform 0.30s 0.88s, background 0.20s"
            : "opacity 0.18s,       transform 0.18s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            "rgba(11, 46, 36, 0.82)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            "rgba(11, 46, 36, 0.55)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="#f4f2ee"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
        Fechar
      </button>
    </div>
  );
}
