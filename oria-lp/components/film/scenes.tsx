"use client";

import React from "react";
import { Easing, clamp, useSprite } from "./animations";
import { C, FD, FB, inout, Mark, Caption, FileGlyph } from "./brand";

// ── ExamCard ─────────────────────────────────────────────────────────────
function ExamCard({
  label,
  value,
  unit,
  x,
  y,
  rot,
  delay,
  localTime,
  flyTo,
}: {
  label: string;
  value: string;
  unit: string;
  x: number;
  y: number;
  rot: number;
  delay: number;
  localTime: number;
  flyTo?: { t0: number; dur: number; x: number; y: number } | null;
}) {
  const appear = clamp((localTime - delay) / 0.6, 0, 1);
  const e = Easing.easeOutBack(appear);
  const drift = Math.sin((localTime + delay * 3) * 1.1) * 5;
  let tx = 0,
    ty = (1 - e) * 34 + drift,
    sc = 0.78 + 0.22 * e,
    op = clamp((localTime - delay) / 0.5, 0, 1),
    rr = rot;
  if (flyTo) {
    const fly = Easing.easeInCubic(
      clamp((localTime - flyTo.t0) / flyTo.dur, 0, 1)
    );
    tx = (flyTo.x - x) * fly;
    ty = ty * (1 - fly) + (flyTo.y - y) * fly;
    sc = sc * (1 - fly) + 0.18 * fly;
    op =
      op *
      (1 -
        Easing.easeInQuad(
          clamp((localTime - flyTo.t0) / flyTo.dur, 0, 1)
        ));
    rr = rot * (1 - fly);
  }
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 270,
        transform: `translate(${tx}px, ${ty}px) rotate(${rr}deg) scale(${sc})`,
        transformOrigin: "center",
        opacity: op,
        background: C.light,
        borderRadius: 20,
        padding: "20px 22px",
        boxShadow: "0 30px 70px rgba(0,0,0,0.45)",
        willChange: "transform, opacity",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <FileGlyph size={38} />
        <div
          style={{
            fontFamily: FB,
            fontWeight: 600,
            fontSize: 19,
            color: "#1a1f1c",
          }}
        >
          {label}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 9,
          marginTop: 16,
        }}
      >
        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: "#e3e7e1",
            width: "92%",
          }}
        />
        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: "#e3e7e1",
            width: "70%",
          }}
        />
      </div>
      <div
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "baseline",
          gap: 6,
        }}
      >
        <span
          style={{ fontFamily: FD, fontWeight: 700, fontSize: 26, color: C.muted }}
        >
          {value}
        </span>
        <span style={{ fontFamily: FB, fontSize: 14, color: "#9aa49b" }}>
          {unit}
        </span>
      </div>
    </div>
  );
}

// ── Scene 1 — the problem ────────────────────────────────────────────────
export function SceneProblem() {
  const { localTime, duration } = useSprite();
  const cam =
    1 + 0.05 * Easing.easeInOutSine(clamp(localTime / duration, 0, 1));
  const cards = [
    {
      label: "Hemograma.pdf",
      value: "4.9",
      unit: "milhões/mm³",
      x: 250,
      y: 250,
      rot: -7,
      delay: 0.0,
    },
    {
      label: "Vitamina D",
      value: "21",
      unit: "ng/mL",
      x: 560,
      y: 430,
      rot: 5,
      delay: 0.18,
    },
    {
      label: "Colesterol",
      value: "212",
      unit: "mg/dL",
      x: 200,
      y: 560,
      rot: 8,
      delay: 0.34,
    },
    {
      label: "TSH",
      value: "3.8",
      unit: "µUI/mL",
      x: 880,
      y: 250,
      rot: -4,
      delay: 0.5,
    },
    {
      label: "Glicose.jpg",
      value: "104",
      unit: "mg/dL",
      x: 900,
      y: 540,
      rot: 6,
      delay: 0.64,
    },
  ];
  const qOp = 0.1 + 0.05 * Math.sin(localTime * 1.4);
  return (
    <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}>
      <div
        style={{
          position: "absolute",
          left: 1080,
          top: 150,
          fontFamily: FD,
          fontWeight: 800,
          fontSize: 360,
          color: C.sage,
          opacity: qOp,
          transform: "rotate(8deg)",
        }}
      >
        ?
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          transform: `scale(${cam})`,
          transformOrigin: "560px 430px",
        }}
      >
        {cards.map((c) => (
          <ExamCard key={c.label} {...c} localTime={localTime} />
        ))}
      </div>
      <Caption
        localTime={localTime}
        duration={duration}
        eyebrow="O problema"
        title={"Seus exames vivem\nespalhados."}
        sub="Soltos em PDFs e fotos, cheios de números difíceis de entender."
        x={120}
        y={700}
      />
    </div>
  );
}

// ── Scene 2 — you send ───────────────────────────────────────────────────
export function SceneSend() {
  const { localTime, duration } = useSprite();
  const panel = inout(localTime, duration, 0.55, 0.5, 30);
  const flyTarget = { t0: 0.4, dur: 0.9, x: 1330, y: 470 };
  const minis = [
    {
      label: "Hemograma.pdf",
      value: "4.9",
      unit: "milhões",
      x: 150,
      y: 300,
      rot: -8,
      delay: 0.0,
    },
    {
      label: "Vitamina D",
      value: "21",
      unit: "ng/mL",
      x: 320,
      y: 560,
      rot: 6,
      delay: 0.12,
    },
    {
      label: "Glicose.jpg",
      value: "104",
      unit: "mg/dL",
      x: 120,
      y: 720,
      rot: 4,
      delay: 0.22,
    },
  ];
  const chipIn = Easing.easeOutBack(clamp((localTime - 1.15) / 0.6, 0, 1));
  const sent = clamp((localTime - 1.9) / 0.4, 0, 1);
  return (
    <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}>
      {minis.map((c) => (
        <ExamCard key={c.label} {...c} localTime={localTime} flyTo={flyTarget} />
      ))}

      <div
        style={{
          position: "absolute",
          left: 1040,
          top: 230,
          width: 620,
          opacity: panel.o,
          transform: `translateY(${panel.y}px)`,
        }}
      >
        <div
          style={{
            background: "rgba(11,46,36,0.82)",
            border: "1px solid rgba(106,138,122,0.35)",
            borderRadius: 30,
            padding: 26,
            boxShadow: "0 40px 90px rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              paddingBottom: 18,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 999,
                background: C.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mark size={26} color={C.light} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: FB,
                  fontWeight: 700,
                  fontSize: 20,
                  color: C.light,
                }}
              >
                ORIA
              </div>
              <div
                style={{
                  fontFamily: FB,
                  fontSize: 14,
                  color: C.glow,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: C.glow,
                    display: "inline-block",
                  }}
                />
                online
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 20,
              maxWidth: 420,
              background: "rgba(255,255,255,0.10)",
              borderRadius: "18px 18px 18px 4px",
              padding: "14px 18px",
              fontFamily: FB,
              fontSize: 19,
              lineHeight: 1.45,
              color: "rgba(244,242,238,0.92)",
            }}
          >
            Olá! Pode me enviar seus exames em PDF ou foto?
          </div>
          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                transform: `scale(${chipIn})`,
                transformOrigin: "right center",
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: "linear-gradient(180deg,#1d4d3b,#143a30)",
                borderRadius: "18px 18px 4px 18px",
                padding: "16px 18px",
                minWidth: 300,
              }}
            >
              <FileGlyph
                size={44}
                color={C.light}
                bg="rgba(244,242,238,0.14)"
              />
              <div>
                <div
                  style={{
                    fontFamily: FB,
                    fontWeight: 600,
                    fontSize: 18,
                    color: C.light,
                  }}
                >
                  exame-sangue.pdf
                </div>
                <div
                  style={{
                    fontFamily: FB,
                    fontSize: 14,
                    color: "rgba(244,242,238,0.6)",
                  }}
                >
                  PDF · 248 KB
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 10,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 6,
              opacity: sent,
              fontFamily: FB,
              fontSize: 14,
              color: C.glow,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M1 13l4 4L13 7M9 15l2 2L23 7"
                stroke={C.glow}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Enviado
          </div>
        </div>
      </div>

      <Caption
        localTime={localTime}
        duration={duration}
        eyebrow="Você envia"
        title={"Tudo começa\nno WhatsApp."}
        sub="Mande em PDF ou foto. Sem app, sem cadastro, sem complicação."
        x={120}
        y={690}
        maxW={760}
      />
    </div>
  );
}

// ── Scene 3 — ORIA processes ─────────────────────────────────────────────
export function SceneProcess() {
  const { localTime, duration } = useSprite();
  const cx = 960,
    cy = 580;
  const enter = Easing.easeOutBack(clamp(localTime / 0.7, 0, 1));
  const pulse = 1 + 0.05 * Math.sin(localTime * 3.0);
  const rings = [0, 0.9, 1.8].map((ph) => {
    const r = ((localTime + ph) % 2.0) / 2.0;
    return { scale: 0.6 + r * 1.9, op: (1 - r) * 0.5 };
  });
  const curve =
    "M300 600 C 560 560, 770 412, 960 430 S 1420 560, 1620 410";
  const draw = Easing.easeInOutCubic(
    clamp((localTime - 0.45) / 1.4, 0, 1)
  );
  const pathRef = React.useRef<SVGPathElement>(null);
  const [pts, setPts] = React.useState<
    { x: number; y: number }[]
  >([]);
  React.useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const L = el.getTotalLength();
    const fr = [0.13, 0.32, 0.5, 0.69, 0.88];
    setPts(
      fr.map((f) => {
        const p = el.getPointAtLength(L * f);
        return { x: p.x, y: p.y };
      })
    );
  }, []);
  const origins = [
    { sx: 300, sy: 250, d: 0.0 },
    { sx: 1520, sy: 280, d: 0.12 },
    { sx: 380, sy: 800, d: 0.22 },
    { sx: 1560, sy: 760, d: 0.32 },
    { sx: 900, sy: 850, d: 0.42 },
  ];
  return (
    <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}>
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        fill="none"
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <defs>
          <filter
            id="pr-glow"
            x="-20%"
            y="-60%"
            width="140%"
            height="220%"
          >
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <path
          ref={pathRef}
          d={curve}
          pathLength="1000"
          stroke={C.glow}
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#pr-glow)"
          strokeDasharray="1000"
          strokeDashoffset={1000 - draw * 1000}
          opacity={0.55}
        />
        <path
          d={curve}
          pathLength="1000"
          stroke={C.glow}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="1000"
          strokeDashoffset={1000 - draw * 1000}
          opacity={0.95}
        />
      </svg>
      {pts.length === origins.length &&
        origins.map((o, i) => {
          const k = Easing.easeInOutCubic(
            clamp((localTime - 0.4 - o.d) / 1.0, 0, 1)
          );
          const px = o.sx + (pts[i].x - o.sx) * k;
          const py = o.sy + (pts[i].y - o.sy) * k;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: px - 7,
                top: py - 7,
                width: 14,
                height: 14,
                borderRadius: 999,
                background: C.glow,
                boxShadow: `0 0 18px ${C.glow}`,
                opacity: 0.45 + 0.55 * k,
              }}
            />
          );
        })}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          transform: "translate(-50%,-50%)",
        }}
      >
        {rings.map((r, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 220,
              height: 220,
              marginLeft: -110,
              marginTop: -110,
              borderRadius: 999,
              border: `2px solid ${C.sage}`,
              opacity: r.op,
              transform: `scale(${r.scale})`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 250,
            height: 250,
            marginLeft: -125,
            marginTop: -125,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(159,230,189,0.22), transparent 70%)",
          }}
        />
        <div
          style={{
            transform: `translate(-50%,-50%) scale(${enter * pulse})`,
            position: "absolute",
            left: "50%",
            top: "50%",
          }}
        >
          <Mark size={150} color={C.glow} />
        </div>
      </div>
      <Caption
        localTime={localTime}
        duration={duration}
        eyebrow="A ORIA processa"
        title={"Organiza, interpreta\ne contextualiza."}
        x={120}
        y={120}
        maxW={760}
      />
    </div>
  );
}

// ── MarkerBar ────────────────────────────────────────────────────────────
export function MarkerBar({
  name,
  value,
  target,
  unit,
  status,
  localTime,
  delay,
}: {
  name: string;
  value: number;
  target: number;
  unit: string;
  status: "ok" | "low" | "attn";
  localTime: number;
  delay: number;
}) {
  const fill = Easing.easeOutCubic(clamp((localTime - delay) / 1.0, 0, 1));
  const shown = Math.round(target * fill);
  const colors = { ok: C.primary, low: "#c9a227", attn: "#b9742f" };
  const bar = colors[status] || C.primary;
  return (
    <div
      style={{
        opacity: clamp((localTime - delay + 0.1) / 0.4, 0, 1),
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: FB,
            fontWeight: 600,
            fontSize: 19,
            color: "#1a1f1c",
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontFamily: FD,
            fontWeight: 700,
            fontSize: 19,
            color: "#1a1f1c",
          }}
        >
          {shown}
          <span
            style={{
              fontFamily: FB,
              fontWeight: 400,
              fontSize: 14,
              color: "#9aa49b",
              marginLeft: 4,
            }}
          >
            {unit}
          </span>
        </span>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: "#e7ece7",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 10,
            borderRadius: 999,
            width: value * fill + "%",
            background: bar,
          }}
        />
      </div>
    </div>
  );
}

// ── Scene 4 — you receive ────────────────────────────────────────────────
export function SceneReceive() {
  const { localTime, duration } = useSprite();
  const card = inout(localTime, duration, 0.6, 0.5, 40);
  const push =
    0.92 +
    0.08 * Easing.easeOutCubic(clamp(localTime / 1.2, 0, 1)) +
    0.04 *
      Easing.easeInOutSine(clamp(localTime / duration, 0, 1));
  const hist = [
    { m: "Jan", v: 54 },
    { m: "Mai", v: 72 },
    { m: "Ago", v: 84 },
  ];
  return (
    <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}>
      <div
        style={{
          position: "absolute",
          left: "55%",
          top: 470,
          transform: `translate(-50%,-50%) scale(${push})`,
          opacity: card.o,
          marginTop: card.y,
        }}
      >
        <div
          style={{
            width: 760,
            background: C.light,
            borderRadius: 30,
            padding: 34,
            boxShadow: "0 50px 120px rgba(0,0,0,0.55)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: FD,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                fontSize: 16,
                fontWeight: 700,
                color: C.primary,
              }}
            >
              Relatório ORIA
            </span>
            <Mark size={30} color={C.primary} />
          </div>
          <div
            style={{
              marginTop: 20,
              background: "#e9f1ea",
              borderRadius: 18,
              padding: 20,
              opacity: clamp((localTime - 0.5) / 0.5, 0, 1),
            }}
          >
            <div
              style={{
                fontFamily: FB,
                fontWeight: 700,
                fontSize: 19,
                color: "#1a1f1c",
              }}
            >
              Resumo simplificado
            </div>
            <div
              style={{
                fontFamily: FB,
                fontSize: 17,
                lineHeight: 1.5,
                color: "#4a5650",
                marginTop: 8,
              }}
            >
              Vitamina D abaixo do ideal. HDL adequado. Glicose dentro da
              faixa, com leve tendência de alta.
            </div>
          </div>
          <div
            style={{
              marginTop: 22,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <MarkerBar
              name="Vitamina D"
              value={42}
              target={21}
              unit="ng/mL"
              status="low"
              localTime={localTime}
              delay={0.9}
            />
            <MarkerBar
              name="HDL"
              value={72}
              target={58}
              unit="mg/dL"
              status="ok"
              localTime={localTime}
              delay={1.15}
            />
            <MarkerBar
              name="Glicose"
              value={66}
              target={104}
              unit="mg/dL"
              status="attn"
              localTime={localTime}
              delay={1.4}
            />
          </div>
          <div
            style={{
              marginTop: 22,
              paddingTop: 20,
              borderTop: "1px solid #e7ece7",
              opacity: clamp((localTime - 1.7) / 0.5, 0, 1),
            }}
          >
            <div
              style={{
                fontFamily: FB,
                fontWeight: 600,
                fontSize: 15,
                color: "#9aa49b",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 14,
              }}
            >
              Histórico
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 26,
                height: 90,
              }}
            >
              {hist.map((h, i) => {
                const g = Easing.easeOutCubic(
                  clamp((localTime - 1.8 - i * 0.12) / 0.6, 0, 1)
                );
                return (
                  <div
                    key={h.m}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 150,
                        height: 70 * (h.v / 84) * g,
                        background:
                          "linear-gradient(180deg,#2a6a51,#1d4d3b)",
                        borderRadius: 10,
                        alignSelf: "stretch",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: FB,
                        fontSize: 15,
                        color: "#9aa49b",
                      }}
                    >
                      {h.m}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Caption
        localTime={localTime}
        duration={duration}
        eyebrow="Você recebe"
        title={"Sua saúde,\nfinalmente clara."}
        x={120}
        y={150}
        maxW={420}
      />
    </div>
  );
}

// ── Scene 5 — closer ──────────────────────────────────────────────────────
export function SceneClose() {
  const { localTime, duration } = useSprite();
  const aWin = inout(localTime, 2.7, 0.6, 0.5, 26);
  const aHide = clamp((localTime - 1.9) / 0.5, 0, 1);
  const headOp = aWin.o * (1 - aHide);

  const t2 = localTime - 2.1;
  const groupIn = clamp(t2 / 0.4, 0, 1);
  const drawMark = Easing.easeInOutCubic(clamp(t2 / 1.15, 0, 1));
  const wipe = Easing.easeInOutCubic(
    clamp((t2 - 0.1) / 1.05, 0, 1)
  );
  const fillIn = clamp((t2 - 1.1) / 0.5, 0, 1);
  const drawFade = 1 - clamp((t2 - 1.2) / 0.45, 0, 1);
  const tagIn = clamp((t2 - 1.5) / 0.5, 0, 1);
  const ctaIn = Easing.easeOutBack(
    clamp((t2 - 1.75) / 0.6, 0, 1)
  );

  const tall = { x: 298, y: 55, w: 52, h: 99 };
  const short = { x: 360, y: 95, w: 42, h: 59 };
  const pill = (p: { x: number; y: number; w: number; h: number }) => {
    const r = p.w / 2;
    return `M ${p.x} ${p.y + r} L ${p.x} ${p.y + p.h - r} A ${r} ${r} 0 0 0 ${p.x + p.w} ${p.y + p.h - r} L ${p.x + p.w} ${p.y + r} A ${r} ${r} 0 0 0 ${p.x} ${p.y + r} Z`;
  };
  const wordW = 280;
  const penX = -16 + wipe * (wordW + 16);
  const textProps = {
    x: 0,
    y: 150,
    fontFamily: FD,
    fontWeight: 800,
    fontSize: 150,
    letterSpacing: "-0.04em",
  } as const;

  return (
    <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 430,
          maxWidth: 1120,
          opacity: headOp,
          transform: `translateY(${aWin.y}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FD,
            fontWeight: 700,
            fontSize: 90,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            color: C.light,
            textWrap: "balance",
          }}
        >
          Não é só um exame.
          <br />
          <span style={{ color: C.glow }}>É a história da sua saúde.</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "40%",
          transform: "translate(-50%,-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: groupIn,
        }}
      >
        <svg
          viewBox="0 0 470 180"
          width="660"
          height="252.7"
          fill="none"
          style={{ overflow: "visible" }}
        >
          <defs>
            <filter
              id="lg-glow"
              x="-20%"
              y="-40%"
              width="140%"
              height="180%"
            >
              <feGaussianBlur stdDeviation="4" />
            </filter>
            <clipPath id="lg-wipe">
              <rect
                x="-30"
                y="-10"
                width={Math.max(0, penX + 18)}
                height="200"
              />
            </clipPath>
          </defs>

          <g clipPath="url(#lg-wipe)" opacity={drawFade}>
            <text {...textProps} fill="none" stroke={C.glow} strokeWidth="2.5" filter="url(#lg-glow)">
              oria
            </text>
            <text {...textProps} fill={C.glow}>
              oria
            </text>
          </g>
          {[tall, short].map((p, i) => (
            <path
              key={i}
              d={pill(p)}
              pathLength="1000"
              stroke={C.glow}
              strokeWidth={i ? 3 : 4}
              strokeLinecap="round"
              filter="url(#lg-glow)"
              strokeDasharray="1000"
              strokeDashoffset={
                1000 -
                clamp(drawMark * 1.12 - i * 0.12, 0, 1) * 1000
              }
              opacity={drawFade}
            />
          ))}
          {wipe < 1 && (
            <circle
              cx={penX}
              cy={92}
              r="6"
              fill={C.glow}
              filter="url(#lg-glow)"
              opacity={groupIn}
            />
          )}

          <g opacity={fillIn}>
            <text {...textProps} fill={C.light}>
              oria
            </text>
            <rect
              x={tall.x}
              y={tall.y}
              width={tall.w}
              height={tall.h}
              rx={tall.w / 2}
              fill={C.glow}
            />
            <rect
              x={short.x}
              y={short.y}
              width={short.w}
              height={short.h}
              rx={short.w / 2}
              fill={C.glow}
              opacity={0.82}
            />
          </g>
        </svg>

        <div
          style={{
            opacity: tagIn,
            fontFamily: FD,
            textTransform: "uppercase",
            letterSpacing: "0.34em",
            fontSize: 18,
            color: "rgba(244,242,238,0.6)",
            marginTop: 18,
          }}
        >
          Personal Health Intelligence
        </div>
        <div
          style={{
            transform: `scale(${ctaIn})`,
            marginTop: 44,
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            background: C.primary,
            color: C.light,
            borderRadius: 999,
            padding: "20px 36px",
            fontFamily: FB,
            fontWeight: 600,
            fontSize: 26,
            boxShadow: "0 24px 60px rgba(14,90,67,0.5)",
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 21a9 9 0 1 0-8.1-5.05L3 21l5.2-1A9 9 0 0 0 12 21z"
              stroke={C.light}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
          Enviar exame pelo WhatsApp
        </div>
      </div>
    </div>
  );
}
