"use client";

import React from "react";
import { Icon, Logo, Button, Badge, Card, Eyebrow } from "./parts";
import {
  Reveal,
  useReducedMotion,
  useCountUp,
  useIsMobile,
  LivingLines,
} from "./motion";
import { UserMenu } from "./user-menu";
import { HeroPhoneScene } from "./phone-chat";
import { Film, FilmMobile } from "./film/film";

const WA = "Enviar exame pelo WhatsApp";

/* ── scrollToId ────────────────────────────────────────────────────────── */
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 40;
  window.scrollTo({ top, behavior: "smooth" });
}

/* ── Nav ───────────────────────────────────────────────────────────────── */
export function Nav({
  onSend,
  theme,
  toggleTheme,
  onLoginClick,
  onSignupClick,
}: {
  onSend: () => void;
  theme: string;
  toggleTheme: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
}) {
  const [active, setActive] = React.useState<string | null>(null);
  const links = [
    { label: "O que é", href: "#solucao", id: "solucao" },
    { label: "Como funciona", href: "#como", id: "como" },
    { label: "O que você recebe", href: "#beneficios", id: "beneficios" },
    { label: "Diferenciais", href: "#diferenciais", id: "diferenciais" },
  ];

  React.useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.id))
      .filter(Boolean) as HTMLElement[];
    const onScroll = () => {
      const y = window.scrollY + window.innerHeight * 0.4;
      let cur: string | null = null;
      for (const s of sections) {
        if (s.offsetTop <= y) cur = s.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 18,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        padding: "0 16px",
        animation:
          "oria-cta-in 0.7s var(--ease-out) 0.1s both",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          className="oria-nav-pill"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            width: "auto",
            maxWidth: "calc(100vw - 32px)",
            padding: "10px 12px 10px 22px",
            borderRadius: "var(--radius-pill)",
            background: "var(--glass-bg)",
            WebkitBackdropFilter: "blur(var(--blur-glass))",
            backdropFilter: "blur(var(--blur-glass))",
            border: "1px solid var(--glass-border)",
            boxShadow: "var(--shadow-glass)",
          }}
        >
          <a
            href="#top"
            style={{
              textDecoration: "none",
              display: "inline-flex",
            }}
          >
            <Logo
              tone={theme === "dark" ? "light" : "primary"}
              size={24}
            />
          </a>
          <nav
            style={{ display: "flex", gap: 4 }}
            className="oria-nav-links"
          >
            {links.map((l) => {
              const isActive = active === l.id;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: isActive
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                    textDecoration: "none",
                    letterSpacing: "0.01em",
                    whiteSpace: "nowrap",
                    padding: "6px 15px",
                    borderRadius: 999,
                    background: isActive
                      ? "var(--accent-soft)"
                      : "transparent",
                    transition:
                      "background 0.28s var(--ease-apple), color 0.28s var(--ease-apple)",
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color =
                        "var(--text-primary)";
                      e.currentTarget.style.background =
                        "rgba(106,138,122,0.10)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color =
                        "var(--text-secondary)";
                      e.currentTarget.style.background =
                        "transparent";
                    }
                  }}
                >
                  {l.label}
                </a>
              );
            })}
          </nav>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <button
              onClick={toggleTheme}
              aria-label="Alternar tema"
              style={{
                background: "transparent",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
                width: 36,
                height: 36,
                borderRadius: 999,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon
                name={theme === "dark" ? "sun" : "moon"}
                size={16}
                color="currentColor"
              />
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={onSend}
              className="oria-nav-cta"
              aria-label="Enviar exame"
            >
              <span className="oria-nav-cta-label">Enviar exame</span>
              <Icon
                name="arrow-up-right"
                size={16}
                color="#f4f2ee"
              />
            </Button>
          </div>
        </div>
        <UserMenu
          theme={theme as "dark" | "light"}
          onLoginClick={onLoginClick}
          onSignupClick={onSignupClick}
        />
      </div>
    </header>
  );
}

/* ── Glow ──────────────────────────────────────────────────────────────── */
function Glow({
  style = {},
  color = "rgba(106,138,122,0.40)",
  className,
}: {
  style?: React.CSSProperties;
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        borderTopLeftRadius: "50%",
        borderTopRightRadius: "50%",
        borderBottomRightRadius: "50%",
        borderBottomLeftRadius: "50%",
        backgroundImage: `radial-gradient(circle, ${color}, transparent 70%)`,
        pointerEvents: "none",
        willChange: "transform",
        ...style,
      }}
    />
  );
}

/* ── SectionHead ───────────────────────────────────────────────────────── */
function SectionHead({
  eyebrow,
  title,
  sub,
  center,
  light,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div
      style={{
        maxWidth: center ? 720 : 640,
        margin: center ? "0 auto" : 0,
        textAlign: center ? "center" : "left",
      }}
    >
      {eyebrow && (
        <div style={{ marginBottom: 14 }}>
          <Eyebrow
            color={light ? "var(--oria-sage)" : "var(--text-muted)"}
          >
            {eyebrow}
          </Eyebrow>
        </div>
      )}
      <h2
        className="oria-headline"
        style={{
          fontSize: "var(--text-3xl)",
          margin: 0,
          color: light
            ? "var(--oria-light-base)"
            : "var(--text-primary)",
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            fontSize: "var(--text-md)",
            lineHeight: 1.55,
            color: light
              ? "rgba(244,242,238,0.78)"
              : "var(--text-secondary)",
            margin: "16px 0 0",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── Hero ──────────────────────────────────────────────────────────────── */
export function Hero({ onSend }: { onSend: () => void }) {
  const reduced = useReducedMotion();

  return (
    <section
      id="top"
      style={{
        position: "relative",
        overflow: "hidden",
        zIndex: 2,
        background: "var(--bg-base)",
        borderRadius: "0 0 28px 28px",
        boxShadow: "var(--shadow-section-bottom)",
      }}
    >
      <Glow
        className="oria-breathe"
        style={{
          top: -160,
          right: -80,
          width: 520,
          height: 520,
          opacity: 0.7,
          position: "absolute",
          pointerEvents: "none",
        }}
      />
      <Glow
        className="oria-breathe"
        style={{
          bottom: -200,
          left: -120,
          width: 440,
          height: 440,
          opacity: 0.5,
          animationDelay: "-8s",
          position: "absolute",
          pointerEvents: "none",
        }}
        color="rgba(29,77,59,0.45)"
      />
      <LivingLines />
      <div
        style={{
          position: "relative",
          maxWidth: "var(--container-wide)",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          gap: 56,
          padding: "124px var(--page-x) 96px",
          alignItems: "center",
        }}
        className="oria-hero-grid"
      >
        <div>
          <Reveal appear delay={60}>
            <Badge
              variant="onDark"
              style={{ color: "var(--badge-hero-text)" }}
            >
              Hub inteligente de exames de saúde
            </Badge>
          </Reveal>
          <Reveal appear delay={150}>
            <h1
              className="oria-headline oria-hero-title"
              style={{
                fontSize: "var(--text-5xl)",
                margin: "22px 0 0",
                maxWidth: 620,
                color: "var(--text-primary)",
              }}
            >
              Seus exames finalmente fazem sentido.
            </h1>
          </Reveal>
          <Reveal appear delay={250}>
            <p
              style={{
                fontSize: "var(--text-md)",
                lineHeight: 1.55,
                color: "var(--text-secondary)",
                maxWidth: 540,
                margin: "22px 0 0",
              }}
            >
              Envie seus exames pelo WhatsApp e receba um
              relatório claro, organizado e compreensível da
              sua saúde ao longo do tempo.
            </p>
          </Reveal>
          <Reveal appear delay={350}>
            <div
              className="oria-hero-cta"
              style={{
                display: "flex",
                gap: 14,
                marginTop: 34,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={onSend}
              >
                <Icon
                  name="message-circle"
                  size={19}
                  color="#f4f2ee"
                />
                {WA}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => scrollToId("como")}
              >
                Ver como funciona
              </Button>
            </div>
          </Reveal>
          <Reveal appear delay={450}>
            <div
              style={{
                display: "flex",
                gap: 26,
                marginTop: 38,
                flexWrap: "wrap",
              }}
            >
              {(
                [
                  ["shield-check", "Dados protegidos"],
                  ["clock", "Resposta em segundos"],
                  [
                    "heart-pulse",
                    "Complementa o médico",
                  ],
                ] as const
              ).map(([ic, t]) => (
                <span
                  key={t}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 9,
                    fontSize: 13,
                    color: "var(--text-muted)",
                  }}
                >
                  <Icon
                    name={ic}
                    size={17}
                    color="var(--oria-sage)"
                  />
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
        <Reveal appear delay={380} y={36}>
          <HeroPhoneScene />
        </Reveal>
      </div>
    </section>
  );
}

/* ── HeroPanel ─────────────────────────────────────────────────────────── */
function HeroPanel() {
  const hist = [
    { m: "Jan", v: 54 },
    { m: "Mai", v: 72 },
    { m: "Ago", v: 81 },
  ];
  const reduced = useReducedMotion();
  const [active, setActive] = React.useState(false);
  const [hovMsg, setHovMsg] = React.useState(false);
  const [hovList, setHovList] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(
      () => setActive(true),
      reduced ? 0 : 760
    );
    return () => clearTimeout(t);
  }, [reduced]);
  return (
    <Card glass padding="20px" style={{ borderRadius: 32 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 16,
        }}
      >
        <div
          style={{
            background: "var(--oria-light-base)",
            borderRadius: 24,
            padding: 20,
            color: "var(--oria-dark-base)",
          }}
        >
          <Eyebrow color="var(--oria-primary)">
            Relatório ORIA
          </Eyebrow>
          <div
            style={{
              background: "#e9f1ea",
              borderRadius: 16,
              padding: 14,
              marginTop: 14,
              cursor: "default",
              transition:
                "transform 0.2s var(--ease-spring)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
            }}
          >
            <div
              style={{ fontWeight: 600, fontSize: 14 }}
            >
              Resumo simplificado
            </div>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 13,
                lineHeight: 1.5,
                color: "rgba(17,23,21,0.62)",
              }}
            >
              Vitamina D abaixo do ideal. HDL adequado.
              Tendência de elevação em marcador de
              atenção.
            </p>
          </div>
          <div
            style={{
              border: "1px solid var(--border-subtle)",
              borderRadius: 16,
              padding: 14,
              marginTop: 12,
              background: "#fff",
              cursor: "default",
              transition:
                "transform 0.2s var(--ease-spring)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                marginBottom: 10,
              }}
            >
              Histórico
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 9,
              }}
            >
              {hist.map((h, i) => (
                <HistBar
                  key={h.m}
                  h={h}
                  active={active}
                  index={i}
                />
              ))}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            background:
              "linear-gradient(180deg,#1d4d3b,#0a3026)",
            borderRadius: 24,
            padding: 18,
            color: "#f4f2ee",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "rgba(244,242,238,0.7)",
              display: "inline-flex",
              gap: 7,
              alignItems: "center",
            }}
          >
            <Icon
              name="message-circle"
              size={15}
              color="#dce7dd"
            />
            WhatsApp
          </div>
          <div
            onMouseEnter={() => setHovMsg(true)}
            onMouseLeave={() => setHovMsg(false)}
            style={{
              borderRadius: 16,
              padding: 13,
              fontSize: 13,
              lineHeight: 1.5,
              transition:
                "background 0.2s, transform 0.2s var(--ease-spring)",
              background: hovMsg
                ? "rgba(255,255,255,0.16)"
                : "rgba(255,255,255,0.10)",
              transform: hovMsg
                ? "translateX(-3px)"
                : "none",
              cursor: "default",
            }}
          >
            Olá! Envie seus exames em PDF ou foto e eu
            organizo tudo para você.
          </div>
          <div
            onMouseEnter={() => setHovList(true)}
            onMouseLeave={() => setHovList(false)}
            style={{
              borderRadius: 16,
              padding: 13,
              marginTop: 10,
              transition:
                "background 0.2s, transform 0.2s var(--ease-spring)",
              background: hovList
                ? "rgba(255,255,255,0.16)"
                : "rgba(255,255,255,0.10)",
              transform: hovList
                ? "translateX(-3px)"
                : "none",
              cursor: "default",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              O que você recebe
            </div>
            {(
              [
                "Resumo claro",
                "Relatório visual",
                "Histórico organizado",
              ] as const
            ).map((t, i) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12.5,
                  color: "rgba(244,242,238,0.88)",
                  padding: "3px 0",
                  opacity: active ? 1 : 0,
                  transform: active
                    ? "none"
                    : "translateX(-6px)",
                  transition: `opacity 0.5s var(--ease-out) ${0.9 + i * 0.12}s, transform 0.5s var(--ease-out) ${0.9 + i * 0.12}s`,
                }}
              >
                <Icon name="check" size={14} color="#dce7dd" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function HistBar({
  h,
  active,
  index,
}: {
  h: { m: string; v: number };
  active: boolean;
  index: number;
}) {
  const val = useCountUp(h.v, active, 1100);
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "rgba(17,23,21,0.52)",
          marginBottom: 3,
        }}
      >
        <span>{h.m}</span>
        <span>{val}</span>
      </div>
      <div
        style={{
          height: 7,
          borderRadius: 999,
          background: "#e7ece7",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 7,
            borderRadius: 999,
            width: (active ? h.v : 0) + "%",
            background: "var(--oria-primary)",
            transition: `width 1.1s var(--ease-out) ${index * 0.14}s`,
          }}
        />
      </div>
    </div>
  );
}

/* ── FilmSection ───────────────────────────────────────────────────────── */
export function FilmSection() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(false);
  const [animated, setAnimated] = React.useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          if (!inView) setInView(true);
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  React.useEffect(() => {
    if (!inView) return;
    const el = ref.current;
    if (!el) return;
    let snapped = false;
    let idle: ReturnType<typeof setTimeout> | null = null;
    let settle: ReturnType<typeof setTimeout> | null = null;

    const clearTimers = () => {
      if (idle) clearTimeout(idle);
      if (settle) clearTimeout(settle);
    };

    const startIdle = () => {
      if (idle) clearTimeout(idle);
      idle = setTimeout(() => {
        if (snapped) return;
        const r = el!.getBoundingClientRect();
        const sectionCentre = r.top + r.height / 2;
        const viewCentre = window.innerHeight / 2;
        const off = Math.abs(sectionCentre - viewCentre);
        if (
          off <
            Math.min(r.height, window.innerHeight) * 0.8 &&
          off >
            Math.min(r.height, window.innerHeight) * 0.15
        ) {
          snapped = true;
          el!.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 1500);
    };

    const onScroll = () => {
      clearTimers();
      if (!snapped)
        settle = setTimeout(startIdle, 300);
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });
    startIdle();

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimers();
    };
  }, [inView]);

  return (
    <div
      ref={ref}
      aria-label="Filme da marca ORIA"
      style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        /* Each film canvas is a fixed-size composition (contain-scaled), so the
           wrapper must match its aspect on every breakpoint or letterbox bars
           read as gaps above/below the video. Mobile uses the dedicated 4:5
           cut; desktop/tablet keeps the 16:9 cut. */
        aspectRatio: isMobile ? "4 / 5" : "16 / 9",
        overflow: "hidden",
        /* The neighbouring sections (Hero above, Problem below) are layered over
           the film (zIndex 2 vs 1) with 28px rounded corners, so the film tucks
           under them. Desktop overlaps by -28; mobile overlaps a touch more
           (-32) so the rounding sits cleanly over the 4:5 cut. The mobile scene
           content is inset from the top/bottom edges (see scenes-mobile.tsx) so
           this tuck only ever covers the living background, never content. */
        marginTop: isMobile ? -32 : -28,
        marginBottom: isMobile ? -32 : -28,
        opacity: animated ? 1 : 0,
        transform: animated
          ? "scale(1) translateY(0)"
          : "scale(0.97) translateY(20px)",
        transition: [
          "opacity 0.9s var(--ease-apple)",
          "transform 1.3s cubic-bezier(0.16,1,0.3,1)",
        ].join(", "),
        willChange: "transform, opacity",
      }}
    >
      {isMobile ? (
        <FilmMobile startOnMount={inView} inline />
      ) : (
        <Film startOnMount={inView} inline />
      )}
    </div>
  );
}

/* ── Problem ───────────────────────────────────────────────────────────── */
export function Problem() {
  const items = [
    {
      ic: "files",
      t: "Exames espalhados",
      d: "Arquivos em PDFs, fotos e laudos soltos que ficam difíceis de reunir e acompanhar.",
    },
    {
      ic: "circle-help",
      t: "Difíceis de entender",
      d: "Resultados técnicos e números isolados sem contexto claro para a pessoa.",
    },
    {
      ic: "history",
      t: "Sem histórico",
      d: "Fica difícil enxergar evolução, tendências e comparações ao longo do tempo.",
    },
    {
      ic: "stethoscope",
      t: "Sem visão integrada",
      d: "Dados existem, mas raramente viram uma narrativa compreensível da saúde.",
    },
  ];
  return (
    <section
      id="solucao"
      style={{
        background: "var(--bg-base)",
        borderRadius: "28px 28px 0 0",
        position: "relative",
        zIndex: 2,
        boxShadow: "var(--shadow-section-top)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--container-wide)",
          margin: "0 auto",
          padding: "var(--space-10) var(--page-x)",
        }}
      >
        <Reveal>
          <SectionHead
            center
            eyebrow="O problema"
            title="Você tem dados. Falta clareza."
            sub="Hoje você tem informação sobre a sua saúde, mas não tem o significado dela."
          />
        </Reveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 18,
            marginTop: 48,
          }}
          className="oria-grid-4"
        >
          {items.map((it, i) => (
            <Reveal key={it.t} delay={i * 90}>
              <Card
                interactive
                radius="sm"
                style={{
                  minHeight: 180,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "var(--accent-soft)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                  }}
                >
                  <Icon
                    name={it.ic}
                    size={22}
                    color="var(--accent)"
                  />
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    letterSpacing: "-0.01em",
                    fontWeight: 700,
                    fontSize: 18,
                    margin: 0,
                  }}
                >
                  {it.t}
                </h3>
                <p
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    color: "var(--text-secondary)",
                    margin: "10px 0 0",
                  }}
                >
                  {it.d}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Solution ──────────────────────────────────────────────────────────── */
export function Solution() {
  const pills = [
    "Organiza seus exames",
    "Explica seus resultados",
    "Cria histórico",
    "Mostra evolução",
  ];
  return (
    <section
      style={{
        position: "relative",
        background:
          "linear-gradient(135deg,#0d4e3b,#0a3026)",
        color: "#f4f2ee",
        overflow: "hidden",
      }}
    >
      <LivingLines opacity={0.5} tone="light" />
      <div
        style={{
          position: "relative",
          maxWidth: "var(--container-wide)",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 48,
          padding: "var(--space-10) var(--page-x)",
          alignItems: "center",
        }}
        className="oria-hero-grid"
      >
        <div>
          <Reveal>
            <SectionHead
              light
              eyebrow="A solução"
              title="A ORIA transforma exames em compreensão da sua saúde."
              sub="Um hub inteligente que organiza, interpreta e acompanha seus exames, criando uma narrativa clara da sua saúde ao longo do tempo."
            />
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 30,
              maxWidth: 460,
            }}
          >
            {pills.map((p, i) => (
              <Reveal key={p} delay={120 + i * 80}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderRadius: 14,
                    border:
                      "1px solid rgba(255,255,255,0.12)",
                    background:
                      "rgba(255,255,255,0.05)",
                    padding: "13px 15px",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  <Icon
                    name="check"
                    size={16}
                    color="#dce7dd"
                  />
                  {p}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal
          delay={160}
          y={34}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Card
            glass
            padding="40px 32px"
            style={{
              background:
                "rgba(255,255,255,0.06)",
              border:
                "1px solid rgba(255,255,255,0.12)",
              textAlign: "center",
            }}
          >
            <Logo
              tone="light"
              size={56}
              style={{ justifyContent: "center" }}
            />
            <div
              style={{
                marginTop: 22,
                fontFamily: "var(--font-display)",
                textTransform: "uppercase",
                letterSpacing: "0.28em",
                fontSize: 11,
                color:
                  "rgba(244,242,238,0.55)",
              }}
            >
              Personal Health Intelligence
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

/* ── HowItWorks ────────────────────────────────────────────────────────── */
export function HowItWorks() {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLElement>(null);
  const [step, setStep] = React.useState(-1);

  React.useEffect(() => {
    if (reduced) { setStep(2); return; }
    const timeline = [
      { s: -1, d: 560 },
      { s: 0,  d: 1700 },
      { s: 1,  d: 2200 },
      { s: 2,  d: 4000 },
    ];
    let started = false;
    let timer: ReturnType<typeof setTimeout>;

    const start = () => {
      if (started) return; started = true;
      let i = 0;
      const run = () => {
        setStep(timeline[i].s);
        timer = setTimeout(() => { i = (i + 1) % timeline.length; run(); }, timeline[i].d);
      };
      run();
    };

    let io: IntersectionObserver | undefined;
    const el = rootRef.current;
    if (el && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (es) => { if (es.some((e) => e.isIntersecting)) start(); },
        { threshold: 0.2 }
      );
      io.observe(el);
    }
    const fb = setTimeout(start, 1200);
    return () => { clearTimeout(timer!); clearTimeout(fb); if (io) io.disconnect(); };
  }, [reduced]);

  const steps = [
    { n: "01", ic: "message-circle", t: "Você envia",      d: "Mande o PDF ou a foto do exame no WhatsApp — sem app, sem cadastro." },
    { n: "02", ic: "sparkles",       t: "A ORIA processa", d: "Organiza, extrai e interpreta cada marcador, com contexto." },
    { n: "03", ic: "file-check",     t: "Você recebe",     d: "Resumo claro, relatório visual e histórico — em segundos." },
  ];

  return (
    <section
      id="como"
      ref={rootRef}
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div
        style={{
          maxWidth: "var(--container-wide)",
          margin: "0 auto",
          padding: "var(--space-10) var(--page-x)",
        }}
      >
        <Reveal appear>
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <Eyebrow>Como funciona</Eyebrow>
            <h2
              className="oria-headline"
              style={{ fontSize: "var(--text-3xl)", margin: "14px 0 0", color: "var(--text-primary)" }}
            >
              Do WhatsApp ao relatório, em uma linha só.
            </h2>
            <p
              style={{
                fontSize: "var(--text-md)",
                lineHeight: 1.55,
                color: "var(--text-secondary)",
                margin: "16px 0 0",
              }}
            >
              Três passos numa mesma trajetória — você acompanha a sua saúde se tornar clara.
            </p>
          </div>
        </Reveal>

        <div className="oria-flow" style={{ marginTop: 64 }}>
          <div className="oria-flow-art">
            <Reveal appear delay={60}  y={30}><ArtSend    active={step >= 0} current={step === 0} /></Reveal>
            <Reveal appear delay={220} y={30}><ArtProcess active={step >= 1} current={step === 1} reduced={reduced} /></Reveal>
            <Reveal appear delay={380} y={30}><ArtReport  active={step >= 2} current={step === 2} /></Reveal>
          </div>

          <div className="oria-flow-rail">
            <Rail step={step} reduced={reduced} />
            <div className="oria-flow-nodes">
              {steps.map((s, i) => {
                const future = step >= 0 && step < i;
                const current = step === i;
                return (
                  <Reveal key={s.n} appear delay={120 + i * 150} y={18}>
                    <div className={"oria-node-col" + (future ? " is-future" : "")}>
                      <span className="oria-node-stem" />
                      <span className={"oria-node" + (current ? " is-current" : "") + (future ? " is-future" : "")}>
                        {s.n}
                      </span>
                      <div className="oria-node-label">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 9, justifyContent: "center" }}>
                          <Icon name={s.ic} size={18} color="var(--accent)" />
                          <strong
                            style={{
                              fontFamily: "var(--font-display)",
                              fontWeight: 700,
                              letterSpacing: "-0.01em",
                              fontSize: 20,
                              color: "var(--text-primary)",
                            }}
                          >
                            {s.t}
                          </strong>
                        </span>
                        <p
                          style={{
                            fontSize: 14,
                            lineHeight: 1.55,
                            color: "var(--text-secondary)",
                            margin: "9px auto 0",
                            maxWidth: 280,
                          }}
                        >
                          {s.d}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Rail ──────────────────────────────────────────────────────────────── */
function Rail({ step, reduced }: { step: number; reduced: boolean }) {
  const centers = [16.667, 50, 83.333];
  const START = 16.667;
  const on = reduced ? true : step >= 0;
  const idx = reduced ? 2 : Math.max(0, step);
  const pos = on ? centers[idx] : START;
  return (
    <div className="oria-rail" aria-hidden="true">
      <span className="oria-rail-base" />
      <span
        className="oria-rail-fill"
        style={{ left: START + "%", width: (pos - START) + "%", opacity: on ? 1 : 0 }}
      />
      <span className="oria-rail-arrow" style={{ left: "41.5%" }} />
      <span className="oria-rail-arrow" style={{ left: "58.5%" }} />
      {!reduced && (
        <span className="oria-rail-pulse" style={{ left: pos + "%", opacity: on ? 1 : 0 }} />
      )}
    </div>
  );
}

/* ── ArtSend ───────────────────────────────────────────────────────────── */
function ArtSend({ active, current }: { active: boolean; current: boolean }) {
  return (
    <div className={"oria-art oria-art-chat" + (current ? " is-current" : active ? "" : " is-idle")}>
      <div className="oria-chat-head">
        <span
          style={{
            display: "inline-flex",
            alignItems: "flex-end",
            gap: 3,
          }}
        >
          <span
            style={{
              width: 8,
              height: 19,
              background: "#dce7dd",
              borderRadius: 999,
            }}
          />
          <span
            style={{
              width: 6,
              height: 12,
              background: "#dce7dd",
              borderRadius: 999,
              opacity: 0.8,
            }}
          />
        </span>
        <div style={{ lineHeight: 1.25 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.02em",
              color: "#f4f2ee",
            }}
          >
            ORIA
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(244,242,238,0.7)",
            }}
          >
            online
          </div>
        </div>
        <Icon
          name="message-circle"
          size={16}
          color="#dce7dd"
          style={{ marginLeft: "auto" }}
        />
      </div>
      <div className="oria-chat-body">
        <div className="oria-bub oria-bub-in">
          Oi! Me envie seu exame em PDF ou foto. 🌿
        </div>
        <div
          className={
            "oria-bub oria-bub-out oria-attach" +
            (active ? " is-on" : "")
          }
        >
          <Icon
            name="file-text"
            size={20}
            color="#dce7dd"
          />
          <span>
            <b style={{ fontWeight: 600 }}>
              hemograma.pdf
            </b>
            <br />
            <span
              style={{ fontSize: 11, opacity: 0.78 }}
            >
              PDF · 248 KB
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── ArtProcess ────────────────────────────────────────────────────────── */
function ArtProcess({
  active,
  current,
  reduced,
}: {
  active: boolean;
  current: boolean;
  reduced: boolean;
}) {
  const markers = [
    { l: "Vitamina D", s: "baixa", w: 42 },
    { l: "HDL", s: "adequado", w: 78 },
    { l: "Glicose", s: "ok", w: 64 },
  ];
  return (
    <div className={"oria-art oria-art-scan" + (current ? " is-current" : active ? "" : " is-idle")}>
      <span
        className="oria-scan-glow"
        aria-hidden="true"
      />
      <div className="oria-scan-head">
        <Icon
          name="sparkles"
          size={15}
          color="var(--oria-sage)"
        />
        <span
          style={{
            fontFamily: "var(--font-display)",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            fontSize: 10.5,
            color: "var(--oria-sage)",
          }}
        >
          Interpretando
        </span>
        <span
          className="oria-scan-spin"
          aria-hidden="true"
        />
      </div>
      <div className="oria-scan-doc">
        {!reduced && (
          <span
            className="oria-scan-beam"
            aria-hidden="true"
          />
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 11,
            position: "relative",
            zIndex: 1,
          }}
        >
          {markers.map((m, i) => (
            <div
              key={m.l}
              className={
                "oria-marker" +
                (active ? " is-on" : "")
              }
              style={{
                transitionDelay:
                  0.25 + i * 0.22 + "s",
              }}
            >
              <span className="oria-marker-dot" />
              <span style={{ flex: 1 }}>
                <span
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    fontSize: 11.5,
                    marginBottom: 5,
                  }}
                >
                  <b
                    style={{
                      fontWeight: 600,
                      color: "var(--oria-light-base)",
                    }}
                  >
                    {m.l}
                  </b>
                  <span
                    style={{
                      color: "var(--oria-sage)",
                    }}
                  >
                    {m.s}
                  </span>
                </span>
                <span className="oria-marker-track">
                  <span
                    className="oria-marker-bar"
                    style={{
                      width:
                        (active ? m.w : 0) +
                        "%",
                      transitionDelay:
                        0.35 +
                        i * 0.22 +
                        "s",
                    }}
                  />
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── ArtReport ─────────────────────────────────────────────────────────── */
function ArtReport({ active, current }: { active: boolean; current: boolean }) {
  const score = useCountUp(86, active, 1200);
  return (
    <div className={"oria-art oria-art-report" + (current ? " is-current" : active ? "" : " is-idle")}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: 10,
              color: "var(--oria-primary)",
            }}
          >
            Relatório ORIA
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              fontSize: 18,
              margin: "5px 0 0",
              color: "var(--oria-dark-base)",
            }}
          >
            Resumo simplificado
          </div>
        </div>
        <span className="oria-rep-score">
          <b>{score}</b>
          <small>índice</small>
        </span>
      </div>
      <p
        style={{
          fontSize: 12.5,
          lineHeight: 1.5,
          color:
            "color-mix(in oklab, #111715 70%, transparent)",
          margin: "12px 0 14px",
        }}
      >
        Vitamina D abaixo do ideal · HDL adequado · sem
        alertas críticos.
      </p>
      <div className="oria-rep-spark">
        {[34, 48, 41, 60, 72, 86].map((h, i) => (
          <span
            key={i}
            style={{
              height:
                (active ? h : 6) + "%",
              transitionDelay:
                0.2 + i * 0.08 + "s",
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 13,
          fontSize: 12,
          color: "var(--oria-primary)",
        }}
      >
        <Icon
          name="trending-up"
          size={15}
          color="var(--oria-primary)"
        />
        <span style={{ fontWeight: 600 }}>
          Evoluindo desde janeiro
        </span>
      </div>
    </div>
  );
}

/* ── Benefits ──────────────────────────────────────────────────────────── */
export function Benefits() {
  const items = [
    {
      ic: "sparkle",
      t: "Resumo simples em linguagem clara",
    },
    {
      ic: "bar-chart-3",
      t: "Relatório visual com organização dos marcadores",
    },
    {
      ic: "calendar-clock",
      t: "Histórico salvo em ordem cronológica",
    },
    {
      ic: "trending-up",
      t: "Comparação ao longo do tempo",
    },
  ];
  return (
    <section
      id="beneficios"
      style={{
        position: "relative",
        background: "var(--bg-surface)",
        overflow: "hidden",
      }}
    >
      <LivingLines opacity={0.35} tone="dark" />
      <div
        style={{
          position: "relative",
          maxWidth: "var(--container-wide)",
          margin: "0 auto",
          padding: "var(--space-10) var(--page-x)",
        }}
      >
        <Reveal>
          <SectionHead
            eyebrow="O que você recebe"
            title="Cada exame vira informação útil."
            sub="Cada exame enviado se transforma em informação clara, útil e organizada para o seu acompanhamento."
          />
        </Reveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 18,
            marginTop: 48,
          }}
          className="oria-grid-4"
        >
          {items.map((b, i) => {
            const [hov, setHov] = React.useState(false);
            return (
              <Reveal key={b.t} delay={i * 90}>
                <div
                  onMouseEnter={() => setHov(true)}
                  onMouseLeave={() =>
                    setHov(false)
                  }
                  style={{
                    position: "relative",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -1,
                      left:
                        "calc(12px + 7%)",
                      right:
                        "calc(12px + 7%)",
                      height: 2,
                      borderRadius: 4,
                      zIndex: 1,
                      background:
                        "linear-gradient(90deg, transparent, var(--oria-primary) 30%, var(--oria-primary) 70%, transparent)",
                      opacity: hov
                        ? 0.55
                        : 0,
                      transform: hov
                        ? "scaleX(1)"
                        : "scaleX(0.3)",
                      transformOrigin:
                        "center",
                      transition:
                        "opacity 0.30s var(--ease-apple), transform 0.35s var(--ease-spring)",
                    }}
                  />
                  <Card
                    interactive
                    radius="sm"
                    style={{
                      minHeight: 100,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent:
                        "center",
                    }}
                  >
                    <span
                      style={{
                        display:
                          "inline-flex",
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background:
                          "var(--oria-primary)",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        marginBottom: 18,
                      }}
                    >
                      <Icon
                        name={b.ic}
                        size={22}
                        color="#f4f2ee"
                      />
                    </span>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        lineHeight: 1.5,
                        margin: 0,
                        color: "var(--text-primary)",
                      }}
                    >
                      {b.t}
                    </p>
                  </Card>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={120}>
          <div
            style={{
              position: "relative",
              marginTop: 40,
              textAlign: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: -8,
                left: "50%",
                transform:
                  "translateX(-50%)",
                width: 0,
                height: 2,
                background:
                  "linear-gradient(90deg, transparent, var(--accent), transparent)",
                animation:
                  "oria-line-extend 1.8s cubic-bezier(0.16,1,0.3,1) 0.4s forwards",
              }}
            />
            <p
              className="oria-headline"
              style={{
                fontSize: "var(--text-2xl)",
                margin: 0,
                color: "var(--text-primary)",
              }}
            >
              Não é só um exame. É a história
              da sua saúde.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── IsIsNot ───────────────────────────────────────────────────────────── */
export function IsIsNot() {
  const yes = [
    "Inteligência que organiza seus exames",
    "Contexto e clareza para suas decisões",
    "Continuidade e visão longitudinal da saúde",
    "Complemento ao cuidado médico",
  ];
  const no = [
    "Não é um aplicativo complexo",
    "Não é um laboratório",
    "Não faz diagnóstico automático",
    "Não substitui o médico",
  ];
  return (
    <section
      id="diferenciais"
      style={{
        maxWidth: "var(--container-wide)",
        margin: "0 auto",
        padding: "var(--space-10) 32px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "0.9fr 1.05fr 1.05fr",
          gap: 22,
          alignItems: "start",
        }}
        className="oria-grid-3"
      >
        <Reveal>
          <SectionHead
            eyebrow="Diferenciais"
            title="O que a ORIA é (e não é)."
            sub="Tecnologia para ampliar consciência, nunca para substituir o cuidado médico."
          />
        </Reveal>
        <Reveal delay={120}>
          <HoverGlow glowColor="#9fe6bd">
            <div
              style={{
                position: "relative",
                minHeight: 310,
                borderRadius:
                  "var(--radius-bento-sm)",
                padding:
                  "var(--space-6)",
                background:
                  "linear-gradient(170deg, #0a2b20 0%, #0b2e24 50%, #0a231a 100%)",
                border:
                  "1px solid rgba(106,138,122,0.35)",
                boxShadow:
                  "var(--shadow-glass)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 22,
                }}
              >
                <span
                  style={{
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    gap: 8,
                    padding: "7px 16px",
                    borderRadius: 999,
                    fontFamily:
                      "var(--font-display)",
                    fontSize:
                      "var(--text-xs)",
                    fontWeight: 700,
                    letterSpacing:
                      "var(--tracking-eyebrow)",
                    textTransform:
                      "uppercase",
                    lineHeight: 1,
                    whiteSpace:
                      "nowrap",
                    background:
                      "rgba(159,230,189,0.16)",
                    color: "#9fe6bd",
                    border:
                      "1px solid rgba(159,230,189,0.28)",
                  }}
                >
                  A ORIA é
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background:
                      "linear-gradient(90deg, rgba(159,230,189,0.30), transparent)",
                  }}
                />
              </div>
              <List
                items={yes}
                icon="check"
                tone="yes"
                interactive
              />
            </div>
          </HoverGlow>
        </Reveal>
        <Reveal delay={210}>
          <HoverGlow glowColor="#1d4d3b">
            <div
              style={{
                position: "relative",
                minHeight: 310,
                borderRadius:
                  "var(--radius-bento-sm)",
                padding:
                  "var(--space-6)",
                background:
                  "var(--bg-elevated)",
                border:
                  "1px solid var(--border-default)",
                boxShadow:
                  "var(--shadow-card)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 22,
                }}
              >
                <span
                  style={{
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    gap: 8,
                    padding: "7px 16px",
                    borderRadius: 999,
                    fontFamily:
                      "var(--font-display)",
                    fontSize:
                      "var(--text-xs)",
                    fontWeight: 700,
                    letterSpacing:
                      "var(--tracking-eyebrow)",
                    textTransform:
                      "uppercase",
                    lineHeight: 1,
                    whiteSpace:
                      "nowrap",
                    background:
                      "var(--accent-soft)",
                    color: "var(--accent)",
                  }}
                >
                  A ORIA não é
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background:
                      "linear-gradient(90deg, var(--border-default), transparent)",
                  }}
                />
              </div>
              <List
                items={no}
                icon="x"
                tone="no"
                interactive
              />
            </div>
          </HoverGlow>
        </Reveal>
      </div>
    </section>
  );
}

/* ── List ──────────────────────────────────────────────────────────────── */
function List({
  items,
  icon,
  tone,
  interactive,
}: {
  items: string[];
  icon: string;
  tone: "yes" | "no";
  interactive?: boolean;
}) {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {items.map((t) => {
        const [hov, setHov] = React.useState(false);
        const isYes = tone === "yes";
        return (
          <li
            key={t}
            onMouseEnter={
              interactive
                ? () => setHov(true)
                : undefined
            }
            onMouseLeave={
              interactive
                ? () => setHov(false)
                : undefined
            }
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              fontSize: 14.5,
              lineHeight: 1.5,
              color: isYes
                ? "var(--oria-light-base)"
                : "var(--text-primary)",
              padding: interactive
                ? "8px 12px"
                : 0,
              borderRadius: interactive
                ? 12
                : 0,
              margin: interactive
                ? "-8px -12px"
                : 0,
              background:
                interactive && hov
                  ? isYes
                    ? "rgba(255,255,255,0.07)"
                    : "var(--accent-soft)"
                  : "transparent",
              transform:
                interactive && hov
                  ? "translateX(6px)"
                  : "none",
              transition: interactive
                ? "background 0.22s var(--ease-apple), transform 0.25s var(--ease-spring)"
                : "none",
              cursor: interactive
                ? "default"
                : "auto",
            }}
          >
            <span
              style={{
                flexShrink: 0,
                width: 24,
                height: 24,
                borderRadius: 999,
                marginTop: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent:
                  "center",
                background: isYes
                  ? "var(--oria-primary)"
                  : "var(--bg-elevated)",
                border: isYes
                  ? "none"
                  : "1px solid var(--border-default)",
                transition: interactive
                  ? "transform 0.25s var(--ease-spring)"
                  : "none",
                transform:
                  interactive && hov
                    ? "scale(1.18)"
                    : "scale(1)",
              }}
            >
              <Icon
                name={icon}
                size={13}
                color={
                  isYes
                    ? "#f4f2ee"
                    : "var(--text-muted)"
                }
              />
            </span>
            {t}
          </li>
        );
      })}
    </ul>
  );
}

/* ── HoverGlow ─────────────────────────────────────────────────────────── */
function HoverGlow({
  children,
  glowColor = "#1d4d3b",
}: {
  children: React.ReactNode;
  glowColor?: string;
}) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        height: "100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -1,
          right: -1,
          bottom: -1,
          left: -1,
          borderRadius: "var(--radius-bento-sm)",
          opacity: hov ? 1 : 0,
          boxShadow: hov
            ? `0 0 24px 2px ${glowColor}44, 0 0 0 1px ${glowColor}55`
            : "none",
          transition:
            "opacity 0.35s var(--ease-apple)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {children}
    </div>
  );
}

/* ── FinalCTA ──────────────────────────────────────────────────────────── */
export function FinalCTA({
  onSend,
}: {
  onSend: () => void;
}) {
  return (
    <section
      style={{
        maxWidth: "var(--container-wide)",
        margin: "0 auto",
        padding: "0 var(--page-x) var(--space-10)",
      }}
    >
      <Reveal y={34}>
        <div
          className="oria-final-cta"
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 32,
            background:
              "linear-gradient(135deg,#1d4d3b,#0a3026)",
            color: "#f4f2ee",
            padding: "52px 48px",
            boxShadow: "var(--shadow-premium)",
          }}
        >
          <Glow
            className="oria-breathe"
            style={{
              top: -120,
              right: -60,
              width: 360,
              height: 360,
              opacity: 0.5,
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              gap: 32,
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                className="oria-headline"
                style={{
                  fontSize: "var(--text-3xl)",
                  margin: 0,
                }}
              >
                Comece agora.
              </h2>
              <p
                style={{
                  fontSize: "var(--text-md)",
                  lineHeight: 1.55,
                  color:
                    "rgba(244,242,238,0.82)",
                  maxWidth: 520,
                  margin: "16px 0 0",
                }}
              >
                Envie seu primeiro exame e veja seus
                resultados com mais clareza, contexto
                e continuidade.
              </p>
            </div>
            <Button
              variant="inverse"
              size="lg"
              onClick={onSend}
            >
              <Icon
                name="message-circle"
                size={19}
                color="var(--oria-primary)"
              />
              {WA}
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ── Footer ────────────────────────────────────────────────────────────── */
export function Footer() {
  const nav: [string, string][] = [
    ["O que é", "#solucao"],
    ["Como funciona", "#como"],
    ["O que você recebe", "#beneficios"],
    ["Diferenciais", "#diferenciais"],
  ];
  return (
    <footer
      style={{
        background: "#082921",
        color: "#f4f2ee",
      }}
    >
      <div
        style={{
          maxWidth: "var(--container-wide)",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns:
            "1.2fr 0.8fr 0.8fr 1.1fr",
          gap: 40,
          padding: "56px var(--page-x)",
        }}
        className="oria-footer-grid"
      >
        <div>
          <Logo tone="light" size={28} />
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color:
                "rgba(244,242,238,0.7)",
              maxWidth: 280,
              marginTop: 18,
            }}
          >
            Transformamos exames em compreensão da
            sua saúde ao longo do tempo.
          </p>
        </div>
        <FootCol title="Navegação" links={nav} />
        <FootCol
          title="Informações"
          links={[
            ["Privacidade", "#"],
            ["Termos", "#"],
            ["Aviso médico", "#"],
          ]}
        />
        <div
          className="oria-footer-notice"
          style={{
            borderRadius: 20,
            border:
              "1px solid rgba(255,255,255,0.10)",
            background:
              "rgba(255,255,255,0.05)",
            padding: 20,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              display: "inline-flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <Icon
              name="info"
              size={15}
              color="#dce7dd"
            />
            Aviso importante
          </div>
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.6,
              color:
                "rgba(244,242,238,0.72)",
              margin: "12px 0 0",
            }}
          >
            A ORIA não fornece diagnóstico médico.
            Os relatórios têm caráter informativo e
            não substituem a consulta com
            profissionais de saúde.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FootCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          fontSize: 11,
          color: "rgba(244,242,238,0.55)",
          fontWeight: 600,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginTop: 16,
        }}
      >
        {links.map(([l, h]) => (
          <a
            key={l}
            href={h}
            style={{
              fontSize: 14,
              color:
                "rgba(244,242,238,0.75)",
              textDecoration: "none",
            }}
          >
            {l}
          </a>
        ))}
      </div>
    </div>
  );
}
