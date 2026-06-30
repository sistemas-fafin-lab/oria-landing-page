/* ORIA brand film — corte 4:5 (1080×1350) para EMBED em seção de LP.
   Recompõe a mesma narrativa de 6 atos para um quadro editorial (não tela
   cheia), reaproveitando os primitivos de marca e as cenas já existentes
   (ExamCard, MarkerBar, ProcessOrbit, Caption, Mark, inout).
   Carregado após brand.jsx e scenes.jsx. */

const MW = 1080, MH = 1350;

/* ── Fundo vivo, enquadrado para 4:5 ────────────────────────────────────── */
function BackdropM() {
  const t = useTime();
  const breathe = 1 + 0.07 * Math.sin(t * 0.55);
  const breathe2 = 1 + 0.06 * Math.sin(t * 0.4 + 2);
  const drift = Math.sin(t * 0.22) * 13;
  const paths = [
    "M 800 -40 C 740 280, 300 470, 400 740 S 860 1160, 320 1420",
    "M 980 -40 C 940 340, 520 540, 560 820 S 1000 1240, 520 1430",
  ];
  const offset = (n) => 1300 - (t * 0.15 + n * 0.4) * 1500;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: -240, right: -200, width: 760, height: 760, borderRadius: "50%", background: "radial-gradient(circle, rgba(106,138,122,0.30), transparent 68%)", transform: `scale(${breathe})` }} />
      <div style={{ position: "absolute", bottom: -260, left: -220, width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(29,77,59,0.42), transparent 70%)", transform: `scale(${breathe2})` }} />
      <svg viewBox="0 0 1080 1350" width="1080" height="1350" fill="none" style={{ position: "absolute", inset: 0, transform: `translateY(${drift}px)` }}>
        <defs>
          <filter id="bdm-glow" x="-40%" y="-10%" width="180%" height="120%"><feGaussianBlur stdDeviation="7" /></filter>
        </defs>
        {paths.map((d, i) => (
          <path key={"b" + i} d={d} stroke={C.sage} strokeWidth={i === 0 ? 2 : 1.4} opacity={i === 0 ? 0.22 : 0.14} />
        ))}
        {paths.map((d, i) => (
          <g key={"g" + i}>
            <path d={d} pathLength="2000" stroke={C.glow} strokeWidth={i === 0 ? 6 : 4} strokeLinecap="round"
              filter="url(#bdm-glow)" strokeDasharray="110 2000" strokeDashoffset={offset(i)} opacity={0.5} />
            <path d={d} pathLength="2000" stroke={C.glow} strokeWidth={i === 0 ? 2 : 1.5} strokeLinecap="round"
              strokeDasharray="110 2000" strokeDashoffset={offset(i)} opacity={0.9} />
          </g>
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 72% at 50% 44%, transparent 54%, rgba(8,12,10,0.58) 100%)" }} />
    </div>
  );
}

/* ── Cena 0 — abertura: a promessa da marca ─────────────────────────────── */
function SceneOpenM() {
  const { localTime, duration } = useSprite();
  const exit = localTime > duration - 0.55 ? 1 - clamp((localTime - (duration - 0.55)) / 0.55, 0, 1) : 1;
  const markOp = clamp(localTime / 0.9, 0, 1);
  const markScale = 0.62 + 0.38 * Easing.easeOutCubic(clamp(localTime / 1.0, 0, 1));
  const halo = 0.5 + 0.5 * Math.sin(localTime * 1.5);
  const lines = [
    { t: "Seus exames", c: C.light, d: 0.95 },
    { t: "finalmente", c: C.light, d: 1.15 },
    { t: "fazem sentido.", c: C.glow, d: 1.35 },
  ];
  const tag = inout(localTime, duration, 1.9, 0.55, 14);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: exit }}>
      <div style={{ position: "relative", marginBottom: 52, opacity: markOp, transform: `scale(${markScale})` }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 300, height: 300, marginLeft: -150, marginTop: -150, borderRadius: 999, background: "radial-gradient(circle, rgba(159,230,189,0.20), transparent 68%)", transform: `scale(${0.9 + halo * 0.18})` }} />
        <Mark size={120} color={C.glow} />
      </div>
      <div style={{ textAlign: "center", padding: "0 70px" }}>
        {lines.map((l) => {
          const a = inout(localTime, duration, l.d, 0.55, 28);
          return (
            <div key={l.t} style={{ opacity: a.o, transform: `translateY(${a.y}px)`, fontFamily: FD, fontWeight: 700, fontSize: 78, lineHeight: 1.05, letterSpacing: "-0.03em", color: l.c }}>
              {l.t}
            </div>
          );
        })}
      </div>
      <div style={{ opacity: tag.o, transform: `translateY(${tag.y}px)`, marginTop: 44, fontFamily: FD, textTransform: "uppercase", letterSpacing: "0.34em", fontSize: 18, fontWeight: 600, color: "rgba(244,242,238,0.5)" }}>
        Inteligência pessoal de saúde
      </div>
    </div>
  );
}

/* ── Costura da jornada: indicador de 3 passos nos atos centrais ────────── */
function JourneyTrackerM() {
  const t = useTime();
  const START = 9.4, END = 25.0;
  if (t < START - 0.05 || t > END + 0.05) return null;
  const op = Math.min(clamp((t - START) / 0.6, 0, 1), 1 - clamp((t - (END - 0.5)) / 0.5, 0, 1));
  const steps = ["Envia", "Processa", "Recebe"];
  const active = t >= 19.0 ? 2 : t >= 14.6 ? 1 : 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, display: "flex", justifyContent: "center", opacity: op, pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {steps.map((s, i) => {
          const on = i <= active, cur = i === active;
          return (
            <React.Fragment key={s}>
              {i > 0 && <div style={{ width: 56, height: 1.5, background: C.sage, opacity: 0.28, marginTop: 7, marginLeft: 6, marginRight: 6 }} />}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 11, width: 116 }}>
                <div style={{ width: 13, height: 13, borderRadius: 999, background: on ? C.glow : "transparent", border: `2px solid ${on ? C.glow : C.sage}`, boxShadow: cur ? `0 0 18px ${C.glow}` : "none", opacity: on ? 1 : 0.5 }} />
                <span style={{ fontFamily: FD, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 17, fontWeight: 600, color: cur ? C.light : on ? "rgba(244,242,238,0.55)" : C.sage, opacity: on ? 1 : 0.5 }}>{s}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ── Cena 1 — o problema ────────────────────────────────────────────────── */
function SceneProblemM() {
  const { localTime, duration } = useSprite();
  const cam = 1 + 0.05 * Easing.easeInOutSine(clamp(localTime / duration, 0, 1));
  const cards = [
    { label: "Hemograma.pdf", value: "4.9", unit: "milhões/mm³", x: 70, y: 600, rot: -7, delay: 0.0 },
    { label: "Vitamina D", value: "21", unit: "ng/mL", x: 660, y: 560, rot: 6, delay: 0.18 },
    { label: "Colesterol", value: "212", unit: "mg/dL", x: 110, y: 880, rot: 7, delay: 0.34 },
    { label: "TSH", value: "3.8", unit: "µUI/mL", x: 700, y: 900, rot: -5, delay: 0.5 },
    { label: "Glicose.jpg", value: "104", unit: "mg/dL", x: 400, y: 1110, rot: 4, delay: 0.64 },
  ];
  const qOp = 0.10 + 0.05 * Math.sin(localTime * 1.4);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 360, top: 640, fontFamily: FD, fontWeight: 800, fontSize: 380, color: C.sage, opacity: qOp, transform: "rotate(8deg)" }}>?</div>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${cam})`, transformOrigin: "540px 820px" }}>
        {cards.map((c) => <ExamCard key={c.label} {...c} localTime={localTime} />)}
      </div>
      <Caption localTime={localTime} duration={duration}
        eyebrow="O problema" title={"Seus exames\nvivem espalhados."}
        sub="Soltos em PDFs e fotos, cheios de números difíceis de entender." x={90} y={130} maxW={900} />
    </div>
  );
}

/* ── Cena 2 — você envia, no WhatsApp ───────────────────────────────────── */
function SceneSendM() {
  const { localTime, duration } = useSprite();
  const panel = inout(localTime, duration, 0.55, 0.5, 32);
  const flyTarget = { t0: 0.4, dur: 0.9, x: 720, y: 760 };
  const minis = [
    { label: "Hemograma.pdf", value: "4.9", unit: "milhões", x: 110, y: 980, rot: -8, delay: 0.0 },
    { label: "Vitamina D", value: "21", unit: "ng/mL", x: 600, y: 1030, rot: 6, delay: 0.12 },
    { label: "Glicose.jpg", value: "104", unit: "mg/dL", x: 300, y: 1130, rot: 4, delay: 0.22 },
  ];
  const chipIn = Easing.easeOutBack(clamp((localTime - 1.15) / 0.6, 0, 1));
  const sent = clamp((localTime - 1.9) / 0.4, 0, 1);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {minis.map((c) => <ExamCard key={c.label} {...c} localTime={localTime} flyTo={flyTarget} />)}

      <div style={{ position: "absolute", left: 130, top: 470, width: 820, opacity: panel.o, transform: `translateY(${panel.y}px)` }}>
        <div style={{ background: "rgba(11,46,36,0.85)", border: "1px solid rgba(106,138,122,0.35)", borderRadius: 30, padding: 30, boxShadow: "0 40px 90px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 15, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ width: 54, height: 54, borderRadius: 999, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mark size={30} color={C.light} />
            </div>
            <div>
              <div style={{ fontFamily: FB, fontWeight: 700, fontSize: 24, color: C.light }}>ORIA</div>
              <div style={{ fontFamily: FB, fontSize: 17, color: C.glow, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, background: C.glow, display: "inline-block" }} />online
              </div>
            </div>
          </div>
          <div style={{ marginTop: 24, maxWidth: 540, background: "rgba(255,255,255,0.10)", borderRadius: "20px 20px 20px 5px", padding: "16px 20px", fontFamily: FB, fontSize: 23, lineHeight: 1.45, color: "rgba(244,242,238,0.92)" }}>
            Olá! Pode me enviar seus exames em PDF ou foto?
          </div>
          <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ transform: `scale(${chipIn})`, transformOrigin: "right center", display: "flex", alignItems: "center", gap: 15, background: "linear-gradient(180deg,#1d4d3b,#143a30)", borderRadius: "20px 20px 5px 20px", padding: "18px 20px", minWidth: 340 }}>
              <FileGlyph size={52} color={C.light} bg="rgba(244,242,238,0.14)" />
              <div>
                <div style={{ fontFamily: FB, fontWeight: 600, fontSize: 22, color: C.light }}>exame-sangue.pdf</div>
                <div style={{ fontFamily: FB, fontSize: 17, color: "rgba(244,242,238,0.6)" }}>PDF · 248 KB</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 11, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 7, opacity: sent, fontFamily: FB, fontSize: 17, color: C.glow }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M1 13l4 4L13 7M9 15l2 2L23 7" stroke={C.glow} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Enviado
          </div>
        </div>
      </div>

      <Caption localTime={localTime} duration={duration}
        eyebrow="Você envia" title={"Tudo começa\nno WhatsApp."}
        sub="Mande em PDF ou foto. Sem app, sem cadastro." x={90} y={130} maxW={900} />
    </div>
  );
}

/* ── Cena 3 — a ORIA processa (sistema orbital) ──────────────────────────── */
function SceneProcessM() {
  const { localTime, duration } = useSprite();
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <ProcessOrbit cx={540} cy={840} localTime={localTime} rScale={0.92} markSize={150} />
      <Caption localTime={localTime} duration={duration}
        eyebrow="A ORIA processa" title={"Organiza, interpreta\ne contextualiza."}
        x={90} y={140} maxW={900} />
    </div>
  );
}

/* ── Cena 4 — você recebe ────────────────────────────────────────────────── */
function SceneReceiveM() {
  const { localTime, duration } = useSprite();
  const card = inout(localTime, duration, 0.6, 0.5, 40);
  const push = 0.86 + 0.03 * Easing.easeOutCubic(clamp(localTime / 1.2, 0, 1)) + 0.02 * Easing.easeInOutSine(clamp(localTime / duration, 0, 1));
  const hist = [{ m: "Jan", v: 54 }, { m: "Mai", v: 72 }, { m: "Ago", v: 84 }];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: "50%", top: 430, transform: `translateX(-50%) scale(${push})`, transformOrigin: "top center", opacity: card.o, marginTop: card.y }}>
        <div style={{ width: 904, background: C.light, borderRadius: 34, padding: 40, boxShadow: "0 50px 120px rgba(0,0,0,0.55)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: FD, textTransform: "uppercase", letterSpacing: "0.22em", fontSize: 19, fontWeight: 700, color: C.primary }}>Relatório ORIA</span>
            <Mark size={34} color={C.primary} />
          </div>
          <div style={{ marginTop: 24, background: "#e9f1ea", borderRadius: 20, padding: 24, opacity: clamp((localTime - 0.5) / 0.5, 0, 1) }}>
            <div style={{ fontFamily: FB, fontWeight: 700, fontSize: 23, color: "#1a1f1c" }}>Resumo simplificado</div>
            <div style={{ fontFamily: FB, fontSize: 20, lineHeight: 1.5, color: "#4a5650", marginTop: 10 }}>
              Vitamina D abaixo do ideal. HDL adequado. Glicose dentro da faixa, com leve tendência de alta.
            </div>
          </div>
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 22 }}>
            <MarkerBar name="Vitamina D" value={42} target={21} unit="ng/mL" status="low" localTime={localTime} delay={0.9} />
            <MarkerBar name="HDL" value={72} target={58} unit="mg/dL" status="ok" localTime={localTime} delay={1.15} />
            <MarkerBar name="Glicose" value={66} target={104} unit="mg/dL" status="attn" localTime={localTime} delay={1.4} />
          </div>
          <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid #e7ece7", opacity: clamp((localTime - 1.7) / 0.5, 0, 1) }}>
            <div style={{ fontFamily: FB, fontWeight: 600, fontSize: 17, color: "#9aa49b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Histórico</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 30, height: 110 }}>
              {hist.map((h, i) => {
                const g = Easing.easeOutCubic(clamp((localTime - 1.8 - i * 0.12) / 0.6, 0, 1));
                return (
                  <div key={h.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <div style={{ width: "100%", maxWidth: 190, height: 86 * (h.v / 84) * g, background: "linear-gradient(180deg,#2a6a51,#1d4d3b)", borderRadius: 12 }} />
                    <span style={{ fontFamily: FB, fontSize: 18, color: "#9aa49b" }}>{h.m}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Caption localTime={localTime} duration={duration}
        eyebrow="Você recebe" title={"Sua saúde,\nfinalmente clara."}
        x={90} y={130} maxW={900} />
    </div>
  );
}

/* ── Cena 5 — fechamento: a luz desenha o logo ──────────────────────────── */
function SceneCloseM() {
  const { localTime } = useSprite();
  const aWin = inout(localTime, 2.7, 0.6, 0.5, 24);
  const aHide = clamp((localTime - 1.9) / 0.5, 0, 1);
  const headOp = aWin.o * (1 - aHide);

  const t2 = localTime - 2.1;
  const groupIn = clamp(t2 / 0.4, 0, 1);
  const drawMark = Easing.easeInOutCubic(clamp(t2 / 1.15, 0, 1));
  const wipe = Easing.easeInOutCubic(clamp((t2 - 0.1) / 1.05, 0, 1));
  const fillIn = clamp((t2 - 1.1) / 0.5, 0, 1);
  const drawFade = 1 - clamp((t2 - 1.2) / 0.45, 0, 1);
  const tagIn = clamp((t2 - 1.5) / 0.5, 0, 1);
  const ctaIn = Easing.easeOutBack(clamp((t2 - 1.95) / 0.6, 0, 1));
  const discIn = clamp((t2 - 2.4) / 0.7, 0, 1);

  const tall = { x: 304, y: 22, w: 52, h: 132 };
  const short = { x: 366, y: 74, w: 42, h: 80 };
  const pill = (p) => {
    const r = p.w / 2;
    return `M ${p.x} ${p.y + r} L ${p.x} ${p.y + p.h - r} A ${r} ${r} 0 0 0 ${p.x + p.w} ${p.y + p.h - r} L ${p.x + p.w} ${p.y + r} A ${r} ${r} 0 0 0 ${p.x} ${p.y + r} Z`;
  };
  const wordW = 279;
  const penX = -16 + wipe * (wordW + 30);
  const textProps = { x: 0, y: 150, fontFamily: FD, fontWeight: 800, fontSize: 150, letterSpacing: "-0.04em" };

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* beat A — manchete */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 520, opacity: headOp, transform: `translateY(${aWin.y}px)`, textAlign: "center" }}>
        <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 66, lineHeight: 1.08, letterSpacing: "-0.025em", color: C.light, textWrap: "balance" }}>
          Não é só um exame.<br /><span style={{ color: C.glow }}>É a história da sua saúde.</span>
        </div>
      </div>

      {/* beat B — logo desenhado pela luz */}
      <div style={{ position: "absolute", left: "50%", top: "44%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", opacity: groupIn }}>
        <svg viewBox="0 0 470 180" width="500" height="191.5" fill="none" style={{ overflow: "visible" }}>
          <defs>
            <filter id="lgm-glow" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="4" /></filter>
            <clipPath id="lgm-wipe"><rect x="-30" y="-10" width={Math.max(0, penX + 18)} height="200" /></clipPath>
          </defs>
          <g clipPath="url(#lgm-wipe)" opacity={drawFade}>
            <text {...textProps} fill="none" stroke={C.glow} strokeWidth="2.5" filter="url(#lgm-glow)">oria</text>
            <text {...textProps} fill={C.glow}>oria</text>
          </g>
          {[tall, short].map((p, i) => (
            <path key={i} d={pill(p)} pathLength="1000" stroke={C.glow} strokeWidth={i ? 3 : 4} strokeLinecap="round" filter="url(#lgm-glow)"
              strokeDasharray="1000" strokeDashoffset={1000 - clamp(drawMark * 1.12 - i * 0.12, 0, 1) * 1000} opacity={drawFade} />
          ))}
          {wipe < 1 && (
            <circle cx={penX} cy={92} r="6" fill={C.glow} filter="url(#lgm-glow)" opacity={groupIn} />
          )}
          <g opacity={fillIn}>
            <text {...textProps} fill={C.light}>oria</text>
            <rect x={tall.x} y={tall.y} width={tall.w} height={tall.h} rx={tall.w / 2} fill={C.glow} />
            <rect x={short.x} y={short.y} width={short.w} height={short.h} rx={short.w / 2} fill={C.glow} opacity={0.82} />
          </g>
        </svg>

        <div style={{ opacity: tagIn, fontFamily: FD, textTransform: "uppercase", letterSpacing: "0.34em", fontSize: 18, color: "rgba(244,242,238,0.6)", marginTop: 18, textAlign: "center" }}>
          Personal Health Intelligence
        </div>
        <div style={{ transform: `scale(${ctaIn})`, marginTop: 40, display: "inline-flex", alignItems: "center", gap: 14, background: C.primary, color: C.light, borderRadius: 999, padding: "21px 38px", fontFamily: FB, fontWeight: 600, fontSize: 27, boxShadow: "0 24px 60px rgba(14,90,67,0.5)" }}>
          <svg width="27" height="27" viewBox="0 0 24 24" fill="none"><path d="M12 21a9 9 0 1 0-8.1-5.05L3 21l5.2-1A9 9 0 0 0 12 21z" stroke={C.light} strokeWidth="1.8" strokeLinejoin="round" /></svg>
          Enviar exame pelo WhatsApp
        </div>
      </div>

      {/* aviso — honestidade sobre limites faz parte da voz da marca */}
      <div style={{ position: "absolute", left: 100, right: 100, bottom: 72, textAlign: "center", opacity: discIn, fontFamily: FB, fontSize: 19, lineHeight: 1.5, color: "rgba(244,242,238,0.4)" }}>
        A ORIA não fornece diagnóstico médico e não substitui a consulta com profissionais de saúde.
      </div>
    </div>
  );
}

Object.assign(window, { MW, MH, BackdropM, SceneOpenM, JourneyTrackerM, SceneProblemM, SceneSendM, SceneProcessM, SceneReceiveM, SceneCloseM });
