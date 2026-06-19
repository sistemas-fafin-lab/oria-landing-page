"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "./parts";
import { useReducedMotion } from "./motion";

/* ── conversation script ───────────────────────────────────────
   ms = how long to dwell AFTER this step before the next one fires.
   "typing" steps show the Oria's typing indicator for `ms`.            */
const PC_SEQ = [
  { type: "day" },
  { type: "typing", ms: 1300 },
  {
    type: "msg", who: "oria", time: "09:41",
    text: "Olá. Sou o Oria. Atuo como um hub inteligente de saúde: organizo seus exames, estruturo seu histórico e elaboro relatórios interpretativos para apoiar seu acompanhamento com especialistas. Envie seus exames para iniciar seu registro.",
    ms: 1700,
  },
  { type: "msg", who: "user", time: "09:41", upload: { name: "exames-sangue.pdf", meta: "15 páginas · 2,4 MB" }, ms: 1500 },
  { type: "typing", ms: 1100 },
  { type: "msg", who: "oria", time: "09:41", text: "Arquivo recebido com sucesso. Deseja adicionar mais exames ou iniciar a organização e elaboração do relatório?", ms: 1400 },
  { type: "msg", who: "user", time: "09:42", text: "Iniciar organização.", ms: 1200 },
  { type: "typing", ms: 1200 },
  {
    type: "msg", who: "oria", time: "09:42",
    text: "Para contextualizar sua análise, indique o motivo principal:",
    options: ["1 — Check-up de rotina", "2 — Investigação de sintomas", "3 — Acompanhamento de condição diagnosticada"],
    ms: 1900,
  },
  { type: "msg", who: "user", time: "09:42", text: "1", ms: 1200 },
  { type: "typing", ms: 1100 },
  { type: "msg", who: "oria", time: "09:42", text: "Estou organizando seus exames e estruturando o relatório interpretativo. Tempo estimado: 3 a 5 minutos.", ms: 900 },
  { type: "process", ms: 4400 },
  { type: "typing", ms: 1300 },
  {
    type: "msg", who: "oria", time: "09:46",
    text: "Seu relatório interpretativo está pronto. Organizei seus exames, destaquei variações relevantes e estruturei sugestões para o acompanhamento com especialistas.",
    report: true, disclaimer: "Este relatório não substitui avaliação médica presencial.",
    ms: 2600,
  },
  { type: "typing", ms: 900 },
  { type: "msg", who: "oria", time: "09:46", text: "Seu histórico está atualizado. Você pode retornar a qualquer momento para incluir novos exames.", chips: true, ms: 5200 },
] as const;

type SeqItem = typeof PC_SEQ[number];

interface MsgItem {
  type: string;
  who?: string;
  time?: string;
  text?: string;
  upload?: { name: string; meta: string };
  options?: string[];
  report?: boolean;
  disclaimer?: string;
  chips?: boolean;
  ms?: number;
}

export function PhoneChat() {
  const reduced = useReducedMotion();
  const [msgs, setMsgs] = useState<MsgItem[]>([]);
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [msgs, typing, reduced]);

  useEffect(() => {
    if (reduced) {
      setMsgs(PC_SEQ.filter((s: SeqItem) => (s as { type: string }).type !== "typing") as unknown as MsgItem[]);
      setTyping(false);
      return;
    }
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (fn: () => void, ms: number) => { const id = setTimeout(() => { if (!cancelled) fn(); }, ms); timers.push(id); };
    let i = 0;
    const run = () => {
      if (cancelled) return;
      if (i >= PC_SEQ.length) {
        wait(() => { setMsgs([]); setTyping(false); i = 0; run(); }, 800);
        return;
      }
      const step = PC_SEQ[i++] as SeqItem;
      if (step.type === "typing") setTyping(true);
      else { setTyping(false); setMsgs((m) => [...m, step as unknown as MsgItem]); }
      wait(run, (step as { ms?: number }).ms || 700);
    };
    wait(run, 600);
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [reduced]);

  return (
    <div style={{ display: "flex", justifyContent: "center", perspective: 1600 }}>
      <PhoneChatStyle />
      <div className="pc-float" style={{ position: "relative", width: 332, filter: "drop-shadow(0 44px 72px rgba(8,20,15,0.42))" }}>
        {/* ── titanium bezel ── */}
        <div style={{
          position: "relative", padding: 11, borderRadius: 58,
          background: "var(--pc-bezel)",
          boxShadow: "var(--pc-bezel-ring)",
        }}>
          <div style={{
            position: "relative", borderRadius: 47, overflow: "hidden", height: 624,
            display: "flex", flexDirection: "column",
            background: "var(--pc-screen-bg)",
          }}>
            {/* wallpaper wash */}
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "var(--pc-wallpaper)", pointerEvents: "none" }} />

            {/* status bar */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 26px 5px", flexShrink: 0, zIndex: 2 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--pc-status-text)", letterSpacing: "0.01em" }}>09:46</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--pc-status-text)" }}>
                <Icon name="signal-high" size={15} color="var(--pc-status-text)" />
                <Icon name="wifi" size={15} color="var(--pc-status-text)" />
                <Icon name="battery-medium" size={18} color="var(--pc-status-text)" />
              </span>
            </div>

            <div aria-hidden="true" style={{ position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)", width: 104, height: 30, background: "#000", borderRadius: 999, zIndex: 4 }} />

            <ChatHeader typing={typing} />

            <div ref={bodyRef} style={{
              position: "relative", zIndex: 1, flex: 1, overflowY: "auto", padding: "14px 13px 8px",
              display: "flex", flexDirection: "column", gap: 9, scrollbarWidth: "none",
            }}>
              {msgs.map((m, idx) => <ChatRow key={idx} m={m} />)}
              {typing && <TypingBubble />}
            </div>

            <ChatComposer />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatHeader({ typing }: { typing: boolean }) {
  return (
    <div style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center", gap: 11, padding: "8px 14px 11px", background: "var(--pc-header-bg)", WebkitBackdropFilter: "blur(14px)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--pc-divider)", flexShrink: 0 }}>
      <Icon name="chevron-left" size={22} color="var(--pc-accent)" />
      <span style={{ position: "relative", width: 40, height: 40, borderRadius: 999, background: "linear-gradient(150deg, #235c47, #0a3026)", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.10)" }}>
        <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2.5, color: "var(--oria-light-base)" }}>
          <span style={{ width: 7, height: 17, background: "currentColor", borderRadius: 999 }} />
          <span style={{ width: 5.5, height: 11, background: "currentColor", borderRadius: 999, opacity: 0.82 }} />
        </span>
      </span>
      <div style={{ lineHeight: 1.25, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5, color: "var(--pc-text)", letterSpacing: "-0.01em" }}>Oria</span>
          <span style={{ width: 14, height: 14, borderRadius: 999, background: "var(--oria-sage)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="check" size={9} color="var(--oria-dark-base)" strokeWidth={3} />
          </span>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--pc-accent)", fontWeight: 500, height: 14 }}>{typing ? "digitando…" : "Hub inteligente de saúde"}</div>
      </div>
      <span style={{ marginLeft: "auto", display: "inline-flex", gap: 16, color: "var(--pc-accent)" }}>
        <Icon name="video" size={19} color="var(--pc-accent)" />
        <Icon name="phone" size={17} color="var(--pc-accent)" />
      </span>
    </div>
  );
}

function ChatRow({ m }: { m: MsgItem }) {
  if (m.type === "day") {
    return (
      <div className="pc-in" style={{ alignSelf: "center", margin: "2px 0 6px" }}>
        <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pc-meta)", background: "var(--pc-chip-bg)", padding: "5px 12px", borderRadius: 999 }}>Hoje</span>
      </div>
    );
  }
  if (m.type === "process") return <ProcessBubble />;

  const mine = m.who === "user";
  return (
    <div className="pc-in" style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "84%", display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
      <div style={{
        position: "relative", padding: m.upload ? "11px 12px" : "9px 12px 7px",
        borderRadius: mine ? "16px 16px 5px 16px" : "16px 16px 16px 5px",
        background: mine ? "var(--pc-out-bg)" : "var(--pc-in-bg)",
        color: mine ? "var(--pc-out-text)" : "var(--pc-in-text)",
        border: mine ? "none" : "1px solid var(--pc-in-border)",
        boxShadow: "0 1px 2px rgba(8,20,15,0.12)",
      }}>
        {m.upload ? (
          <FilePill upload={m.upload} />
        ) : (
          <span style={{ fontSize: 13.5, lineHeight: 1.5, letterSpacing: "0.01em", whiteSpace: "pre-wrap" }}>{m.text}</span>
        )}

        {m.options && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
            {m.options.map((o) => (
              <span key={o} style={{ fontSize: 12.5, fontWeight: 500, color: "var(--pc-option-text)", background: "var(--pc-option-bg)", border: "1px solid var(--pc-option-border)", borderRadius: 10, padding: "8px 11px" }}>{o}</span>
            ))}
          </div>
        )}

        {m.report && <ReportMini />}
        {m.disclaimer && (
          <div style={{ display: "flex", gap: 7, alignItems: "flex-start", marginTop: 9, fontSize: 10.5, lineHeight: 1.45, color: "var(--pc-meta)" }}>
            <Icon name="info" size={12} color="var(--pc-accent)" style={{ marginTop: 1, flexShrink: 0 }} />
            <span>{m.disclaimer}</span>
          </div>
        )}

        <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 5, fontSize: 9.5, color: mine ? "var(--pc-meta-out)" : "var(--pc-meta)" }}>
          {m.time}
          {mine && <Icon name="check-check" size={13} color="var(--pc-accent)" />}
        </span>
      </div>

      {m.chips && (
        <div style={{ display: "flex", gap: 7, marginTop: 8, flexWrap: "wrap" }}>
          {["Adicionar exame", "Ver histórico"].map((c) => (
            <span key={c} style={{ fontSize: 11.5, fontWeight: 600, color: "var(--pc-accent)", border: "1px solid var(--pc-option-border)", background: "var(--pc-chip-bg)", borderRadius: 999, padding: "6px 13px" }}>{c}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function FilePill({ upload }: { upload: { name: string; meta: string } }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 178 }}>
      <span style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: "var(--pc-pdf-icon-bg)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="file-text" size={19} color="var(--pc-out-text)" />
      </span>
      <span style={{ lineHeight: 1.4, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{upload.name}</span>
        <span style={{ display: "block", fontSize: 11, opacity: 0.78, whiteSpace: "nowrap" }}>{upload.meta}</span>
      </span>
    </span>
  );
}

function TypingBubble() {
  return (
    <div className="pc-in" style={{ alignSelf: "flex-start" }}>
      <div style={{ display: "inline-flex", gap: 4, padding: "12px 14px", borderRadius: "16px 16px 16px 5px", background: "var(--pc-in-bg)", border: "1px solid var(--pc-in-border)" }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="pc-dot" style={{ width: 6, height: 6, borderRadius: 999, background: "var(--oria-sage)", animationDelay: `${i * 0.16}s` }} />
        ))}
      </div>
    </div>
  );
}

function ProcessBubble() {
  const reduced = useReducedMotion();
  const steps = [
    "Estruturando resultados por categoria",
    "Identificando variações relevantes",
    "Consolidando histórico evolutivo",
    "Finalizando relatório interpretativo",
  ];
  const [done, setDone] = useState(reduced ? steps.length : 0);
  useEffect(() => {
    if (reduced) return;
    let i = 0;
    const id = setInterval(() => { i += 1; setDone(i); if (i >= steps.length) clearInterval(id); }, 850);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className="pc-in" style={{ alignSelf: "flex-start", maxWidth: "88%" }}>
      <div style={{ padding: "13px 14px", borderRadius: "16px 16px 16px 5px", background: "var(--pc-in-bg)", border: "1px solid var(--pc-in-border)", color: "var(--pc-in-text)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
          <span className="pc-spin" style={{ width: 14, height: 14, borderRadius: 999, border: "2px solid var(--pc-spin-track)", borderTopColor: "var(--oria-sage)", flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 9.5, fontWeight: 600, color: "var(--pc-accent)" }}>Processando relatório</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {steps.map((s, i) => {
            const isDone = i < done;
            const isActive = i === done;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12, transition: "opacity .4s var(--ease-out)", opacity: isDone || isActive ? 1 : 0.38 }}>
                <span style={{ flexShrink: 0, width: 16, height: 16, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: isDone ? "var(--oria-sage)" : "transparent", border: isDone ? "none" : "1.5px solid var(--pc-option-border)" }}>
                  {isDone
                    ? <span className="pc-pop" style={{ display: "inline-flex" }}><Icon name="check" size={10} color="var(--oria-dark-base)" strokeWidth={3} /></span>
                    : isActive ? <span className="pc-spin" style={{ width: 9, height: 9, borderRadius: 999, border: "1.5px solid var(--pc-spin-track)", borderTopColor: "var(--oria-sage)" }} /> : null}
                </span>
                <span style={{ color: isDone ? "var(--pc-text)" : "var(--pc-meta)" }}>{s}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReportMini() {
  const rows = [
    { l: "Vitamina D", s: "Atenção", tone: "warn" },
    { l: "Colesterol HDL", s: "Adequado", tone: "ok" },
    { l: "Glicemia", s: "Normal", tone: "ok" },
  ];
  const tones: Record<string, { color: string; bg: string }> = {
    ok: { color: "#1d4d3b", bg: "#dcefe3" },
    warn: { color: "#7d6320", bg: "#f3ecd6" },
  };
  return (
    <div style={{ marginTop: 11, padding: 13, borderRadius: 14, background: "var(--oria-light-base)", color: "#111715", boxShadow: "0 8px 22px rgba(0,0,0,0.28)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 8.5, fontWeight: 700, color: "var(--oria-primary)" }}>Relatório ORIA</span>
        <Icon name="file-check" size={14} color="var(--oria-primary)" />
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", margin: "4px 0 11px", color: "#111715" }}>Resumo interpretativo</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {rows.map((r) => (
          <div key={r.l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11.5, fontWeight: 500, color: "#4a514d" }}>{r.l}</span>
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: tones[r.tone].color, background: tones[r.tone].bg, borderRadius: 999, padding: "3px 9px" }}>{r.s}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 11, paddingTop: 10, borderTop: "1px solid rgba(17,23,21,0.12)", fontSize: 10.5, color: "#788171" }}>
        <Icon name="layers" size={12} color="var(--oria-muted)" />
        <span>12 marcadores analisados · histórico atualizado</span>
      </div>
    </div>
  );
}

function ChatComposer() {
  return (
    <div style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center", gap: 9, padding: "10px 12px 14px", background: "var(--pc-composer-bg)", borderTop: "1px solid var(--pc-divider)", flexShrink: 0 }}>
      <Icon name="plus" size={22} color="var(--pc-accent)" />
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "var(--pc-input-bg)", border: "1px solid var(--pc-option-border)", borderRadius: 999, padding: "9px 14px" }}>
        <span style={{ flex: 1, fontSize: 13, color: "var(--pc-meta)" }}>Mensagem</span>
        <Icon name="smile" size={17} color="var(--pc-accent)" />
      </div>
      <span style={{ width: 38, height: 38, borderRadius: 999, background: "var(--oria-primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "var(--shadow-cta)" }}>
        <Icon name="mic" size={17} color="#f4f2ee" />
      </span>
    </div>
  );
}

/* ── orbital scene — floating health-intelligence cues behind the phone ── */
export function HeroPhoneScene() {
  const reduced = useReducedMotion();
  return (
    <div className="oria-hero-phone" style={{ position: "relative", width: "min(500px, 100%)", margin: "0 auto", minHeight: 720, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div aria-hidden="true" className={reduced ? "" : "pc-breathe"} style={{ position: "absolute", width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle, rgba(106,138,122,0.24), transparent 66%)", zIndex: 0, willChange: "transform" }} />

      <svg aria-hidden="true" viewBox="0 0 500 720" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, overflow: "visible" }} fill="none">
        <g className={reduced ? "" : "pc-ring-spin"} style={{ transformOrigin: "250px 360px" }}>
          <ellipse cx="250" cy="360" rx="232" ry="316" stroke="var(--oria-sage)" strokeWidth="1" opacity="0.16" />
          <ellipse cx="250" cy="360" rx="190" ry="272" stroke="var(--oria-sage)" strokeWidth="1" opacity="0.10" strokeDasharray="2 9" />
        </g>
      </svg>

      {/* floating chips */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
        <FloatChip reduced={reduced} d={7.4} dl={0.0} style={{ top: 58, left: -34 }}>
          <FloatCard icon="file-check" lines={["Relatório", "pronto"]} />
        </FloatChip>
        <FloatChip reduced={reduced} d={6.6} dl={0.3} style={{ top: 44, right: -16 }}>
          <FloatOrb icon="message-circle" />
        </FloatChip>
        <FloatChip reduced={reduced} d={8.2} dl={1.1} style={{ top: 296, left: -10 }}>
          <FloatOrb icon="heart-pulse" />
        </FloatChip>
        <FloatChip reduced={reduced} d={8.6} dl={0.7} style={{ top: 286, right: -54 }}>
          <FloatMetric />
        </FloatChip>
        <FloatChip reduced={reduced} d={7.8} dl={0.5} style={{ top: 516, left: -28 }}>
          <FloatCard icon="clock" lines={["Histórico", "atualizado"]} />
        </FloatChip>
        <FloatChip reduced={reduced} d={7.0} dl={1.5} style={{ top: 488, right: 2 }}>
          <FloatOrb icon="trending-up" />
        </FloatChip>
      </div>

      <div style={{ position: "relative", zIndex: 2 }}><PhoneChat /></div>
    </div>
  );
}

function FloatChip({ children, style = {}, d = 7, dl = 0, reduced }: { children: React.ReactNode; style?: React.CSSProperties; d?: number; dl?: number; reduced: boolean }) {
  const cssCustom = { "--pcd": d + "s", "--pcdl": dl + "s" } as React.CSSProperties;
  return (
    <div className={reduced ? "" : "pc-orbit"} style={{ position: "absolute", ...cssCustom, ...style }}>
      {children}
    </div>
  );
}

const FLOAT_SURFACE: React.CSSProperties = {
  background: "var(--glass-bg)", WebkitBackdropFilter: "blur(16px)", backdropFilter: "blur(16px)",
  border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-premium)",
};

function FloatOrb({ icon }: { icon: string }) {
  return (
    <div style={{ width: 54, height: 54, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", ...FLOAT_SURFACE }}>
      <Icon name={icon} size={22} color="var(--accent)" />
    </div>
  );
}

function FloatCard({ icon, lines }: { icon: string; lines: string[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px 10px 11px", borderRadius: 16, ...FLOAT_SURFACE }}>
      <span style={{ width: 32, height: 32, borderRadius: 10, background: "var(--accent-soft)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={16} color="var(--accent)" />
      </span>
      <span style={{ lineHeight: 1.25, color: "var(--text-primary)" }}>
        {lines.map((l, i) => (
          <span key={i} style={{ display: "block", fontSize: 12, fontWeight: i === 0 ? 600 : 500, color: i === 0 ? "var(--text-primary)" : "var(--text-muted)", whiteSpace: "nowrap" }}>{l}</span>
        ))}
      </span>
    </div>
  );
}

function FloatMetric() {
  return (
    <div style={{ padding: "11px 14px", borderRadius: 16, minWidth: 134, ...FLOAT_SURFACE }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 28, height: 28, borderRadius: 9, background: "rgba(154,123,46,0.16)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="droplet" size={15} color="#b58e3a" />
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap" }}>Vitamina D</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 9 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8a6b1f", background: "rgba(154,123,46,0.16)", borderRadius: 999, padding: "3px 8px" }}>Atenção</span>
        <Icon name="arrow-up-right" size={14} color="#b58e3a" />
      </div>
    </div>
  );
}

/* ── injected keyframes (once) ──────────────────────────────── */
function PhoneChatStyle() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      /* ── phone palette tokens — LIGHT default, dark inside .dark ── */
      :root {
        --pc-bezel: linear-gradient(150deg, #f4f2ec 0%, #d6d2c8 42%, #bdb9b0 72%, #eae7e0 100%);
        --pc-bezel-ring: inset 0 0 0 1.5px rgba(255,255,255,0.72), inset 0 0 0 5px #c7c3ba, 0 2px 4px rgba(0,0,0,0.08);
        --pc-screen-bg: #ece7dd;
        --pc-wallpaper: radial-gradient(120% 60% at 50% -8%, rgba(106,138,122,0.10), transparent 60%), radial-gradient(90% 50% at 90% 110%, rgba(29,77,59,0.07), transparent 70%);
        --pc-status-text: #15231d;
        --pc-header-bg: rgba(255,255,255,0.82);
        --pc-divider: rgba(17,23,21,0.10);
        --pc-text: #15231d;
        --pc-meta: rgba(17,23,21,0.45);
        --pc-meta-out: rgba(20,58,48,0.55);
        --pc-accent: #1d4d3b;
        --pc-in-bg: #ffffff;
        --pc-in-text: #15231d;
        --pc-in-border: rgba(17,23,21,0.07);
        --pc-out-bg: #d4ead6;
        --pc-out-text: #143a30;
        --pc-chip-bg: rgba(17,23,21,0.05);
        --pc-option-bg: rgba(29,77,59,0.06);
        --pc-option-text: #15231d;
        --pc-option-border: rgba(29,77,59,0.18);
        --pc-input-bg: rgba(255,255,255,0.9);
        --pc-composer-bg: rgba(255,255,255,0.72);
        --pc-spin-track: rgba(29,77,59,0.18);
        --pc-pdf-icon-bg: rgba(20,58,48,0.12);
      }
      .dark {
        --pc-bezel: linear-gradient(150deg, #2c322f 0%, #11201a 38%, #060d0a 70%, #1c2420 100%);
        --pc-bezel-ring: inset 0 0 0 1.5px rgba(255,255,255,0.12), inset 0 0 0 5px #05100c, 0 2px 4px rgba(255,255,255,0.06);
        --pc-screen-bg: var(--oria-dark-base);
        --pc-wallpaper: radial-gradient(120% 60% at 50% -8%, rgba(106,138,122,0.18), transparent 60%), radial-gradient(90% 50% at 90% 110%, rgba(29,77,59,0.30), transparent 70%);
        --pc-status-text: var(--oria-light-base);
        --pc-header-bg: rgba(11,46,36,0.72);
        --pc-divider: var(--border-strong);
        --pc-text: var(--oria-light-base);
        --pc-meta: rgba(244,242,238,0.50);
        --pc-meta-out: rgba(244,242,238,0.62);
        --pc-accent: var(--oria-sage);
        --pc-in-bg: #15231d;
        --pc-in-text: var(--oria-light-base);
        --pc-in-border: var(--border-strong);
        --pc-out-bg: var(--oria-primary);
        --pc-out-text: #f4f2ee;
        --pc-chip-bg: rgba(255,255,255,0.06);
        --pc-option-bg: rgba(106,138,122,0.16);
        --pc-option-text: var(--oria-light-base);
        --pc-option-border: var(--border-default);
        --pc-input-bg: rgba(255,255,255,0.07);
        --pc-composer-bg: rgba(11,46,36,0.55);
        --pc-spin-track: rgba(106,138,122,0.30);
        --pc-pdf-icon-bg: rgba(244,242,238,0.16);
      }
      .pc-in { animation: pc-in .42s var(--ease-spring, cubic-bezier(.34,1.4,.5,1)) both; }
      @keyframes pc-in { from { opacity: 0; transform: translateY(9px) scale(.97); } to { opacity: 1; transform: none; } }
      .pc-dot { animation: pc-dot 1.1s ease-in-out infinite; }
      @keyframes pc-dot { 0%,60%,100% { transform: translateY(0); opacity: .45; } 30% { transform: translateY(-4px); opacity: 1; } }
      .pc-spin { animation: pc-spin 1s linear infinite; }
      @keyframes pc-spin { to { transform: rotate(360deg); } }
      .pc-pop { animation: pc-pop .3s var(--ease-spring, cubic-bezier(.34,1.4,.5,1)) both; }
      @keyframes pc-pop { from { transform: scale(0); } to { transform: scale(1); } }
      @media (prefers-reduced-motion: no-preference) {
        .pc-float { animation: pc-float 6.5s ease-in-out infinite; }
        @keyframes pc-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
        .pc-orbit { animation: pc-orbit var(--pcd, 7s) ease-in-out var(--pcdl, 0s) infinite; }
        @keyframes pc-orbit { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-13px); } }
        .pc-breathe { animation: pc-breathe 13s ease-in-out infinite; }
        @keyframes pc-breathe { 0%,100% { transform: scale(1); opacity: .82; } 50% { transform: scale(1.12); opacity: 1; } }
        .pc-ring-spin { animation: pc-ring-spin 80s linear infinite; }
        @keyframes pc-ring-spin { to { transform: rotate(360deg); } }
      }
      @media (prefers-reduced-motion: reduce) {
        .pc-in, .pc-dot, .pc-spin, .pc-pop, .pc-orbit, .pc-breathe, .pc-ring-spin { animation: none !important; }
      }
    ` }} />
  );
}
