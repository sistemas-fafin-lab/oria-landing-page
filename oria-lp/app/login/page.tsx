"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { Icon, Logo, Button, Badge } from "../../components/parts";
import { Reveal } from "../../components/motion";
import { requestCode, verifyCode, login, resetPassword, setToken } from "../../lib/auth-client";
import {
  SkipLink,
  ShortcutsButton,
  ShortcutsOverlay,
  useKeydown,
  isTypingTarget,
  type ShortcutGroup,
} from "../../components/keyboard";
import { useAccessibility } from "../../components/accessibility";
import { useTheme } from "../../components/theme";

/* ───────────── máscaras ───────────── */
const cadDigits = (s: string) => (s || "").replace(/\D/g, "");

function cadMaskPhone(v: string) {
  const d = cadDigits(v).slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/* ───────────── validações ───────────── */
function cadValPhone(v: string): string | null {
  const d = cadDigits(v);
  if (!d) return "Informe seu telefone com DDD.";
  if (d.length < 10) return "Telefone incompleto — DDD + número.";
  const ddd = parseInt(d.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) return "DDD inválido.";
  if (d.length === 11 && d[2] !== "9") return "Celular deve começar com 9.";
  return null;
}

function cadValSenha(v: string): string | null {
  if (!v) return "Crie uma nova senha.";
  if (v.length < 8) return "Use ao menos 8 caracteres.";
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return "Combine letras e números.";
  return null;
}

const CAD_CLAY = "#c4684f";

/* glow radial decorativo */
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
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        pointerEvents: "none",
        willChange: "transform",
        ...style,
      }}
    />
  );
}

/* ───────────── campo com floating label ───────────── */
interface FieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string | null;
  valid?: boolean;
  helper?: string;
  inputMode?: "text" | "tel" | "numeric";
  maxLength?: number;
  autoComplete?: string;
  name: string;
  autoFocus?: boolean;
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  error,
  valid,
  helper,
  inputMode = "text",
  maxLength,
  autoComplete,
  name,
  autoFocus,
}: FieldProps) {
  const [focus, setFocus] = useState(false);
  const up = focus || (value && value.length > 0);
  const bc = error
    ? "rgba(196,104,79,0.7)"
    : focus
      ? "var(--oria-sage)"
      : "var(--border-default)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ position: "relative" }}>
        <label
          htmlFor={name}
          style={{
            position: "absolute",
            left: 17,
            pointerEvents: "none",
            top: up ? 9 : "50%",
            transform: up ? "none" : "translateY(-50%)",
            fontFamily: up ? "var(--font-display)" : "var(--font-body)",
            fontSize: up ? 10.5 : 15,
            fontWeight: up ? 600 : 400,
            textTransform: up ? "uppercase" : "none",
            letterSpacing: up ? "0.13em" : "0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: up ? "calc(100% - 30px)" : "calc(100% - 48px)",
            color: error ? CAD_CLAY : focus ? "var(--oria-sage)" : "var(--text-muted)",
            transition: "all var(--dur-base) var(--ease-apple)",
          }}
        >
          {label}
        </label>
        <input
          id={name}
          name={name}
          type="text"
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          value={value}
          onChange={onChange}
          onFocus={() => setFocus(true)}
          onBlur={(e) => {
            setFocus(false);
            onBlur && onBlur();
          }}
          aria-invalid={!!error}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "25px 44px 9px 16px",
            borderRadius: 16,
            background: "var(--bg-base)",
            color: "var(--text-primary)",
            border: `1px solid ${bc}`,
            outline: "none",
            boxShadow: focus ? "0 0 0 3px rgba(106,138,122,0.22)" : "none",
            fontFamily: "var(--font-body)",
            fontSize: 16,
            letterSpacing: "0.01em",
            transition:
              "border-color var(--dur-base) var(--ease-apple), box-shadow var(--dur-base) var(--ease-apple)",
          }}
        />
        {(valid || error) && (
          <span
            style={{
              position: "absolute",
              right: 15,
              top: "50%",
              transform: "translateY(-50%)",
              display: "inline-flex",
            }}
          >
            {valid ? (
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: "var(--oria-primary)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="check" size={13} color="#f4f2ee" />
              </span>
            ) : (
              <Icon name="circle-help" size={18} color={CAD_CLAY} />
            )}
          </span>
        )}
      </div>
      {(error || helper) && (
        <span
          style={{
            fontSize: 12.5,
            lineHeight: 1.45,
            paddingLeft: 4,
            color: error ? CAD_CLAY : "var(--text-muted)",
          }}
        >
          {error || helper}
        </span>
      )}
    </div>
  );
}

/* ───────────── campo de senha (com mostrar/ocultar) ───────────── */
interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string | null;
  helper?: string;
  name: string;
  autoFocus?: boolean;
  autoComplete?: string;
}

function PasswordField({
  label,
  value,
  onChange,
  onBlur,
  error,
  helper,
  name,
  autoFocus,
  autoComplete = "off",
}: PasswordFieldProps) {
  const [focus, setFocus] = useState(false);
  const [show, setShow] = useState(false);
  const up = focus || (value && value.length > 0);
  const bc = error
    ? "rgba(196,104,79,0.7)"
    : focus
      ? "var(--oria-sage)"
      : "var(--border-default)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ position: "relative" }}>
        <label
          htmlFor={name}
          style={{
            position: "absolute",
            left: 17,
            pointerEvents: "none",
            top: up ? 9 : "50%",
            transform: up ? "none" : "translateY(-50%)",
            fontFamily: up ? "var(--font-display)" : "var(--font-body)",
            fontSize: up ? 10.5 : 15,
            fontWeight: up ? 600 : 400,
            textTransform: up ? "uppercase" : "none",
            letterSpacing: up ? "0.13em" : "0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: up ? "calc(100% - 30px)" : "calc(100% - 48px)",
            color: error ? CAD_CLAY : focus ? "var(--oria-sage)" : "var(--text-muted)",
            transition: "all var(--dur-base) var(--ease-apple)",
          }}
        >
          {label}
        </label>
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          value={value}
          onChange={onChange}
          onFocus={() => setFocus(true)}
          onBlur={(e) => {
            setFocus(false);
            onBlur && onBlur();
          }}
          aria-invalid={!!error}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "25px 48px 9px 16px",
            borderRadius: 16,
            background: "var(--bg-base)",
            color: "var(--text-primary)",
            border: `1px solid ${bc}`,
            outline: "none",
            boxShadow: focus ? "0 0 0 3px rgba(106,138,122,0.22)" : "none",
            fontFamily: "var(--font-body)",
            fontSize: 16,
            letterSpacing: show ? "0.01em" : "0.12em",
            transition:
              "border-color var(--dur-base) var(--ease-apple), box-shadow var(--dur-base) var(--ease-apple)",
          }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 6,
            display: "inline-flex",
            color: focus ? "var(--oria-sage)" : "var(--text-muted)",
          }}
        >
          <Icon name={show ? "eye-off" : "eye"} size={18} color="currentColor" />
        </button>
      </div>
      {(error || helper) && (
        <span
          style={{
            fontSize: 12.5,
            lineHeight: 1.45,
            paddingLeft: 4,
            color: error ? CAD_CLAY : "var(--text-muted)",
          }}
        >
          {error || helper}
        </span>
      )}
    </div>
  );
}

/* ───────────── OTP — caixas de código ───────────── */
interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

function OtpInput({ length = 6, value, onChange, error }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const set = (i: number, ch: string) => {
    const arr = value.split("");
    arr[i] = ch;
    onChange(arr.join("").slice(0, length));
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[i]) set(i, "");
      else if (i > 0) {
        refs.current[i - 1] && refs.current[i - 1]?.focus();
        set(i - 1, "");
      }
    } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < length - 1)
      refs.current[i + 1]?.focus();
  };

  const onInput = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const ch = cadDigits(e.target.value).slice(-1);
    if (!ch) return;
    set(i, ch);
    if (i < length - 1) refs.current[i + 1] && refs.current[i + 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const d = cadDigits(e.clipboardData.getData("text")).slice(0, length);
    if (d) {
      onChange(d);
      const last = Math.min(d.length, length - 1);
      refs.current[last] && refs.current[last]?.focus();
    }
  };

  return (
    <div style={{ display: "flex", gap: "clamp(6px, 2.2vw, 10px)", width: "100%" }} onPaste={onPaste}>
      {Array.from({ length }).map((_, i) => {
        const filled = !!value[i];
        return (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            inputMode="numeric"
            maxLength={1}
            value={value[i] || ""}
            onChange={(e) => onInput(i, e)}
            onKeyDown={(e) => onKey(i, e)}
            aria-label={`Dígito ${i + 1}`}
            style={{
              flex: "1 1 0",
              minWidth: 0,
              maxWidth: 56,
              height: "clamp(52px, 13.5vw, 60px)",
              textAlign: "center",
              borderRadius: 16,
              background: "var(--bg-base)",
              color: "var(--text-primary)",
              border: `1px solid ${
                error ? "rgba(196,104,79,0.7)" : filled ? "var(--oria-sage)" : "var(--border-default)"
              }`,
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(20px, 5.5vw, 24px)",
              outline: "none",
              transition: "all var(--dur-base) var(--ease-apple)",
              boxShadow: filled ? "0 0 0 3px rgba(106,138,122,0.16)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

/* ───────────── indicador de passos ───────────── */
interface StepHeaderProps {
  step: number;
  total: number;
  label: string;
  eyebrow?: string;
  showSteps?: boolean;
}

function StepHeader({ step, total, label, eyebrow, showSteps = true }: StepHeaderProps) {
  return (
    <div style={{ marginBottom: 30 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-eyebrow)",
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            color: "var(--oria-sage)",
          }}
        >
          {eyebrow || `Passo ${step} de ${total}`}
        </span>
        {showSteps && (
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                style={{
                  width: i + 1 === step ? 26 : 8,
                  height: 8,
                  borderRadius: 999,
                  background: i + 1 <= step ? "var(--oria-primary)" : "var(--border-default)",
                  transition: "all .5s var(--ease-spring)",
                }}
              />
            ))}
          </div>
        )}
      </div>
      <h2
        className="oria-headline"
        style={{ fontSize: "var(--text-xl)", margin: "14px 0 0", color: "var(--text-primary)" }}
      >
        {label}
      </h2>
    </div>
  );
}

/* ───────────── painel de marca (lado esquerdo) ───────────── */
function BrandLines() {
  const paths = [
    "M-20 380 C 300 380, 420 140, 720 170 S 1180 420, 1460 150",
    "M-20 440 C 340 420, 500 240, 780 250 S 1220 480, 1460 240",
  ];
  return (
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true" fill="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <defs>
        <filter id="oria-bl-glow" x="-10%" y="-60%" width="120%" height="220%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      {/* faint static wires */}
      {paths.map((d, i) => (
        <path key={"b" + i} d={d} stroke="#bfe0cb" strokeWidth={i === 0 ? 1.5 : 1} opacity={i === 0 ? 0.34 : 0.2} />
      ))}
      {/* Traveling light — soft blurred glow + bright core, the same look used
          by the landing's LivingLines. The dash period (70 + 1000 = 1070)
          matches the keyframe travel distance, so the loop is seamless: the
          light flows on without jumping back at the seam. A gentle breathe on
          the group makes the glow pulse as it travels. */}
      {paths.map((d, i) => {
        const travel = { animationDelay: `${i * -3.7}s`, animationDuration: `${8 + i * 1.8}s` };
        return (
          <g key={"g" + i} className="oria-line-breathe">
            <path className="oria-line-travel" style={travel} d={d} pathLength="1000"
              stroke="#eafaf0" strokeWidth={i === 0 ? 5 : 3.5} strokeLinecap="round"
              filter="url(#oria-bl-glow)" strokeDasharray="70 1000" opacity={0.5} />
            <path className="oria-line-travel" style={travel} d={d} pathLength="1000"
              stroke="#eafaf0" strokeWidth={i === 0 ? 1.6 : 1.2} strokeLinecap="round"
              strokeDasharray="70 1000" opacity={0.9} />
          </g>
        );
      })}
    </svg>
  );
}

const BrandPanel = memo(function BrandPanel() {
  const floats = [
    { ic: "message-circle", t: "Tudo pelo WhatsApp", d: "Sem aplicativo para instalar" },
    { ic: "shield-check", t: "Dados protegidos", d: "Privacidade em primeiro lugar" },
    { ic: "file-check", t: "Relatório em segundos", d: "Resumo claro e histórico organizado" },
  ];

  return (
    <div
      className="oria-cad-brand"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(150deg,#1d4d3b,#0a3026)",
        color: "#f4f2ee",
        padding: "clamp(28px, 5vh, 56px) clamp(28px, 4vw, 52px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Glow
        className="oria-breathe"
        style={{ top: -160, right: -100, width: 460, height: 460, opacity: 0.55 }}
      />
      <Glow
        className="oria-breathe"
        style={{ bottom: -180, left: -130, width: 380, height: 380, opacity: 0.4, animationDelay: "-9s" }}
        color="rgba(159,230,189,0.22)"
      />
      <BrandLines />

      <div style={{ position: "relative" }}>
        <Logo tone="light" size={28} />
        <div style={{ marginTop: "clamp(20px, 4.5vh, 52px)" }}>
          <div className="oria-rise" style={{ animationDelay: "60ms" }}>
            <Badge variant="onDark">Entrar</Badge>
          </div>
          <h1
            className="oria-headline oria-rise oria-cad-brand-title"
            style={{ animationDelay: "140ms", fontSize: "clamp(1.9rem, 1.1rem + 1.6vw + 1vh, 3.25rem)", margin: "clamp(12px, 2vh, 20px) 0 0", maxWidth: 420 }}
          >
            Bem-vindo de volta.
          </h1>
          <p
            className="oria-rise oria-cad-brand-text"
            style={{
              animationDelay: "230ms",
              fontSize: "var(--text-md)",
              lineHeight: 1.6,
              color: "rgba(244,242,238,0.78)",
              maxWidth: 400,
              margin: "clamp(10px, 1.6vh, 20px) 0 0",
            }}
          >
            Acesse sua conta com seu telefone e continue acompanhando a história da sua saúde.
          </p>
        </div>
      </div>

      <div
        className="oria-cad-floats"
        style={{ position: "relative", display: "flex", flexDirection: "column", gap: "clamp(8px, 1.4vh, 14px)", marginTop: "clamp(16px, 3vh, 44px)", paddingTop: 0 }}
      >
        {floats.map((f, i) => (
          <div key={f.t} className="oria-rise" style={{ animationDelay: `${360 + i * 120}ms` }}>
            <div
              className="oria-float-card"
              style={{
                animationDelay: `-${i * 2}s`,
                marginLeft: i * 26,
                display: "flex",
                alignItems: "center",
                gap: 14,
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.13)",
                background: "rgba(255,255,255,0.06)",
                WebkitBackdropFilter: "blur(10px)",
                backdropFilter: "blur(10px)",
                padding: "14px 17px",
                maxWidth: 320,
                boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  background: "rgba(220,231,221,0.16)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name={f.ic as any} size={20} color="#dce7dd" />
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <strong style={{ fontSize: 14, fontWeight: 600 }}>{f.t}</strong>
                <span style={{ fontSize: 12, color: "rgba(244,242,238,0.62)" }}>{f.d}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        className="oria-cad-brand-foot"
        style={{
          position: "relative",
          marginTop: "auto",
          paddingTop: "clamp(14px, 2.2vh, 28px)",
          display: "flex",
          alignItems: "center",
          gap: 9,
          fontSize: 12.5,
          color: "rgba(244,242,238,0.6)",
        }}
      >
        <Icon name="lock" size={14} color="var(--oria-sage)" />
        A ORIA não fornece diagnóstico médico nem substitui a consulta com profissionais de saúde.
      </div>
    </div>
  );
});

/* ───────────── atalhos de teclado ───────────── */
const AUTH_SHORTCUTS: ShortcutGroup[] = [
  {
    heading: "Formulário",
    items: [
      { keys: ["Enter"], label: "Avançar / confirmar" },
      { keys: ["Esc"], label: "Voltar à etapa anterior" },
    ],
  },
  {
    heading: "Código de verificação",
    items: [
      { keys: ["←", "→"], label: "Mover entre os dígitos" },
      { keys: ["Backspace"], label: "Apagar o dígito anterior" },
    ],
  },
  {
    heading: "Geral",
    items: [{ keys: ["?"], label: "Mostrar/ocultar esta ajuda" }],
  },
];

/* ───────────── app de login ───────────── */
export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<
    "phone" | "otp" | "senha" | "reset-otp" | "reset-senha" | "done"
  >("phone");
  const [data, setData] = useState({
    telefone: "",
    senha: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // otp state
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState<string | null>(null);
  const [resend, setResend] = useState(0);
  const [loading, setLoading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  // JWT devolvido pelo login (senha válida) — só é persistido após
  // o usuário confirmar o token do WhatsApp. Login = senha + token.
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  // fluxo "Esqueci minha senha" — reaproveita o telefone e a OTP do WhatsApp
  const [resetSenha, setResetSenha] = useState("");
  const [resetSenhaConfirm, setResetSenhaConfirm] = useState("");
  const [resetErr, setResetErr] = useState<{ senha?: string | null; confirm?: string | null }>({});
  const [resetOk, setResetOk] = useState(false);
  // cooldown (segundos) do botão "Esqueci minha senha" — evita reenvios em sequência
  const [resetCooldown, setResetCooldown] = useState(0);
  // loading dedicado ao envio do reset, para não afetar o botão "Entrar"
  const [resetLoading, setResetLoading] = useState(false);
  const { shortcutsEnabled } = useAccessibility();

  // tema global (claro/escuro/sistema) — compartilhado com todo o site
  const { isDark, toggle: toggleTheme } = useTheme();
  const theme = isDark ? "dark" : "light";

  const vals = { telefone: cadValPhone };

  const setTelefone = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const raw = typeof e === "string" ? e : e.target.value;
    const v = cadMaskPhone(raw);
    setData((s) => ({ ...s, telefone: v }));
    if (touched.telefone)
      setErrors((s) => ({ ...s, telefone: vals.telefone?.(v) || null }));
  };

  const blurTelefone = () => {
    setTouched((s) => ({ ...s, telefone: true }));
    setErrors((s) => ({ ...s, telefone: vals.telefone?.(data.telefone) || null }));
  };

  const okTelefone: boolean | undefined = touched.telefone && !errors.telefone && !!data.telefone;

  // senha handler
  const setSenha = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setData((s) => ({ ...s, senha: v }));
    if (touched.senha)
      setErrors((s) => ({ ...s, senha: v ? null : "Digite sua senha." }));
  };

  const blurSenha = () => {
    setTouched((s) => ({ ...s, senha: true }));
    setErrors((s) => ({ ...s, senha: data.senha ? null : "Digite sua senha." }));
  };

  // resend countdown
  useEffect(() => {
    if (resend <= 0) return;
    const t = setTimeout(() => setResend((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resend]);

  // cooldown do "Esqueci minha senha"
  useEffect(() => {
    if (resetCooldown <= 0) return;
    const t = setTimeout(() => setResetCooldown((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resetCooldown]);

  const proceedPhone = () => {
    const err = cadValPhone(data.telefone);
    setTouched((s) => ({ ...s, telefone: true }));
    setErrors((s) => ({ ...s, telefone: err }));
    setResetOk(false);
    if (!err) setStep("senha");
  };

  // Reenvia o token do WhatsApp dentro do passo de verificação.
  const resendCode = async () => {
    setResend(30);
    setCode("");
    setCodeErr(null);
    const result = await requestCode(data.telefone);
    if (!result.ok) {
      setCodeErr(result.error || "Erro ao reenviar código");
    }
  };

  const handleVerifyCode = async () => {
    if (loading) return;
    if (code.length < 6) {
      setCodeErr("Digite os 6 dígitos do código.");
      return;
    }

    setLoading(true);
    const result = await verifyCode(data.telefone, code);
    setLoading(false);

    if (!result.ok || !result.valido) {
      setCodeErr(result.message || result.error || "Código inválido");
      return;
    }

    // Senha já foi validada; só agora, com o token confirmado, a sessão é criada.
    if (!pendingToken) {
      setCodeErr("Sessão expirada. Refaça o login com sua senha.");
      setStep("senha");
      return;
    }

    setToken(pendingToken);
    setCodeErr(null);
    setStep("done");
  };

  // Login = senha + token. Validamos a senha primeiro; o JWT fica retido
  // até o token do WhatsApp ser confirmado no passo seguinte.
  const submitSenha = async () => {
    if (loading) return;
    const e1 = data.senha ? null : "Digite sua senha.";
    setTouched((s) => ({ ...s, senha: true }));
    setErrors((s) => ({ ...s, senha: e1 }));
    if (e1) return;

    setLoading(true);

    // 1. Verifica a senha (não persiste o token ainda).
    const result = await login(data.telefone, data.senha);
    if (!result.ok || !result.user?.token) {
      setLoading(false);
      setErrors((s) => ({ ...s, senha: result.error || "Credenciais inválidas" }));
      return;
    }
    setPendingToken(result.user.token);

    // 2. Envia o token de autenticação pelo WhatsApp.
    const codeResult = await requestCode(data.telefone);
    setLoading(false);

    if (!codeResult.ok) {
      setErrors((s) => ({ ...s, senha: codeResult.error || "Erro ao enviar código" }));
      return;
    }

    setCode("");
    setCodeErr(null);
    setResend(30);
    setStep("otp");
  };

  // "Esqueci minha senha": dispara a OTP do WhatsApp e abre o fluxo de redefinição.
  const startReset = async () => {
    if (loading || resetLoading || resetCooldown > 0) return;

    const err = cadValPhone(data.telefone);
    setTouched((s) => ({ ...s, telefone: true }));
    setErrors((s) => ({ ...s, telefone: err }));
    if (err) {
      setStep("phone");
      return;
    }

    // Trava imediata: bloqueia cliques repetidos mesmo se a request falhar.
    setResetCooldown(30);
    setResetLoading(true);
    const result = await requestCode(data.telefone);
    setResetLoading(false);

    if (!result.ok) {
      setErrors((s) => ({ ...s, senha: result.error || "Erro ao enviar código" }));
      return;
    }

    setCode("");
    setCodeErr(null);
    setResetOk(false);
    setResetSenha("");
    setResetSenhaConfirm("");
    setResetErr({});
    setResend(30);
    setStep("reset-otp");
  };

  // Valida a OTP antes de liberar a criação da nova senha (o servidor revalida no envio).
  const verifyResetCode = async () => {
    if (loading) return;
    if (code.length < 6) {
      setCodeErr("Digite os 6 dígitos do código.");
      return;
    }

    setLoading(true);
    const result = await verifyCode(data.telefone, code);
    setLoading(false);

    if (!result.ok || !result.valido) {
      setCodeErr(result.message || result.error || "Código inválido");
      return;
    }

    setCodeErr(null);
    setStep("reset-senha");
  };

  const submitReset = async () => {
    if (loading) return;
    const e1 = cadValSenha(resetSenha);
    const e2 = !resetSenhaConfirm
      ? "Confirme sua senha."
      : resetSenhaConfirm !== resetSenha
        ? "As senhas não coincidem."
        : null;
    setResetErr({ senha: e1, confirm: e2 });
    if (e1 || e2) return;

    setLoading(true);
    const result = await resetPassword(data.telefone, code, resetSenha);
    setLoading(false);

    if (!result.ok) {
      setResetErr({ senha: result.error || "Erro ao redefinir senha" });
      return;
    }

    // Senha redefinida: volta ao login com a nova senha (que dispara senha + token).
    setData((s) => ({ ...s, senha: "" }));
    setTouched((s) => ({ ...s, senha: false }));
    setErrors((s) => ({ ...s, senha: null }));
    setResetSenha("");
    setResetSenhaConfirm("");
    setResetErr({});
    setResetOk(true);
    setStep("senha");
  };

  useKeydown((e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Escape") {
      if (helpOpen) { setHelpOpen(false); return; }
      if (!shortcutsEnabled) return;
      if (step === "otp") { e.preventDefault(); setStep("senha"); }
      else if (step === "senha") { e.preventDefault(); setStep("phone"); }
      else if (step === "reset-otp" || step === "reset-senha") { e.preventDefault(); setStep("senha"); }
      return;
    }
    if (!shortcutsEnabled) return;
    if (isTypingTarget(e.target)) {
      if (e.key === "Enter" && step !== "done") {
        e.preventDefault();
        if (step === "phone") proceedPhone();
        else if (step === "otp") handleVerifyCode();
        else if (step === "senha") submitSenha();
        else if (step === "reset-otp") verifyResetCode();
        else if (step === "reset-senha") submitReset();
      }
      return;
    }
    if (e.key === "?") { e.preventDefault(); setHelpOpen((o) => !o); }
  });

  const isReset = step === "reset-otp" || step === "reset-senha";
  const stepNum = step === "senha" ? 2 : step === "otp" ? 3 : 1;
  const labels = {
    phone: "Acesse sua conta",
    otp: "Verifique seu número",
    senha: "Acesse com sua senha",
    "reset-otp": "Verifique seu número",
    "reset-senha": "Crie uma nova senha",
  };

  const authLink = {
    background: "none",
    border: "none",
    color: "var(--oria-sage)",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "var(--font-body)",
    padding: 0,
  };

  return (
    <div className={theme === "dark" ? "dark" : ""} style={{ background: "var(--bg-base)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <SkipLink targetId="conteudo" />
      <div className="oria-cad-shell" style={{ display: "grid", gridTemplateColumns: "0.92fr 1.08fr", minHeight: "100vh" }}>
        <BrandPanel />

        {/* lado do formulário */}
        <div
          id="conteudo"
          tabIndex={-1}
          className="oria-cad-form-wrap"
          style={{ display: "flex", flexDirection: "column", padding: "56px 64px", position: "relative", outline: "none" }}
        >
          <button
            onClick={() => router.push("/")}
            aria-label="Voltar para página inicial"
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: 999,
              width: 40,
              height: 40,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-secondary)",
              WebkitBackdropFilter: "blur(var(--blur-glass))",
              backdropFilter: "blur(var(--blur-glass))",
              transition: "all 0.2s var(--ease-apple)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.borderColor = "var(--border-default)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.borderColor = "var(--glass-border)";
            }}
          >
            <Icon name="chevron-left" size={20} color="currentColor" />
          </button>
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: 999,
              width: 40,
              height: 40,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-secondary)",
              WebkitBackdropFilter: "blur(var(--blur-glass))",
              backdropFilter: "blur(var(--blur-glass))",
              transition: "all 0.2s var(--ease-apple)",
              zIndex: 2,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.borderColor = "var(--border-default)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.borderColor = "var(--glass-border)";
            }}
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} size={19} color="currentColor" />
          </button>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 460, margin: "0 auto" }}>
            {step !== "done" && (
              <StepHeader
                step={stepNum}
                total={3}
                label={labels[step]}
                eyebrow={isReset ? "Redefinir senha" : undefined}
                showSteps={false}
              />
            )}

            {/* PASSO 1 — telefone */}
            {step === "phone" && (
              <div key="phone" className="oria-step-enter" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <Field
                  name="login-telefone"
                  label="Telefone (WhatsApp)"
                  inputMode="tel"
                  maxLength={15}
                  autoComplete="tel-national"
                  autoFocus
                  value={data.telefone}
                  onChange={setTelefone}
                  onBlur={blurTelefone}
                  error={touched.telefone ? errors.telefone : null}
                  valid={okTelefone}
                  helper="Use o telefone cadastrado para entrar com sua senha."
                />
                <Button variant="primary" size="lg" type="button" style={{ width: "100%", marginTop: 6 }} onClick={proceedPhone}>
                  Continuar
                  <Icon name="arrow-up-right" size={18} color="#f4f2ee" />
                </Button>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--text-muted)", justifyContent: "center", marginTop: 4 }}>
                  <span>Não tem conta?</span>
                  <button type="button" onClick={() => router.push("/signup")} style={authLink}>
                    Criar conta
                  </button>
                </div>
              </div>
            )}

            {/* PASSO 1b — OTP */}
            {step === "otp" && (
              <div className="oria-step-enter" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--text-secondary)", margin: "-8px 0 0" }}>
                  Senha confirmada. Enviamos um código de 6 dígitos para{" "}
                  <strong style={{ color: "var(--text-primary)" }}>{data.telefone}</strong> para concluir seu acesso.
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    style={{ background: "none", border: "none", color: "var(--oria-sage)", fontWeight: 600, cursor: "pointer", padding: "0 0 0 6px", fontSize: 14, fontFamily: "var(--font-body)" }}
                  >
                    Alterar
                  </button>
                </p>
                <OtpInput value={code} onChange={(c) => { setCode(c); setCodeErr(null); }} error={codeErr} />
                {codeErr && <span style={{ fontSize: 12.5, color: CAD_CLAY, marginTop: -8 }}>{codeErr}</span>}
                <Button
                  variant="primary"
                  size="lg"
                  type="button"
                  style={{ width: "100%", marginTop: 2 }}
                  loading={loading}
                  onClick={handleVerifyCode}
                  iconRight={<Icon name="log-in" size={18} color="#f4f2ee" />}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
                <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
                  {resend > 0 ? (
                    <span>
                      Reenviar código em <strong style={{ color: "var(--text-secondary)" }}>{resend}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={resendCode}
                      style={{ background: "none", border: "none", color: "var(--oria-sage)", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)" }}
                    >
                      Reenviar código
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* PASSO 2 — senha */}
            {step === "senha" && (
              <div className="oria-step-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {resetOk && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "11px 15px",
                      borderRadius: 14,
                      background: "rgba(106,138,122,0.14)",
                      border: "1px solid rgba(106,138,122,0.35)",
                    }}
                  >
                    <Icon name="check" size={17} color="var(--oria-primary)" />
                    <span style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
                      Senha redefinida! Entre com sua nova senha.
                    </span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "11px 15px",
                    borderRadius: 14,
                    background: "var(--accent-soft)",
                    marginBottom: 4,
                  }}
                >
                  <Icon name="user-round" size={17} color="var(--accent)" />
                  <span style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
                    Entrando como <strong style={{ color: "var(--text-primary)" }}>{data.telefone}</strong>.
                    <button
                      type="button"
                      onClick={() => setStep("phone")}
                      style={{ background: "none", border: "none", color: "var(--oria-sage)", fontWeight: 600, cursor: "pointer", padding: "0 0 0 6px", fontSize: 13.5, fontFamily: "var(--font-body)" }}
                    >
                      Alterar
                    </button>
                  </span>
                </div>
                <PasswordField
                  name="login-senha"
                  label="Senha"
                  autoFocus
                  autoComplete="current-password"
                  value={data.senha}
                  onChange={setSenha}
                  onBlur={blurSenha}
                  error={touched.senha ? errors.senha : null}
                />
                <div className="oria-cad-inline-links" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: -4 }}>
                  <button
                    type="button"
                    onClick={startReset}
                    disabled={loading || resetLoading || resetCooldown > 0}
                    aria-busy={resetLoading || undefined}
                    style={{
                      ...authLink,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: loading || resetLoading || resetCooldown > 0 ? "not-allowed" : "pointer",
                      opacity: loading || resetLoading || resetCooldown > 0 ? 0.55 : 1,
                    }}
                  >
                    {resetLoading && (
                      <Icon name="loader-circle" size={14} color="currentColor" className="oria-spin-inline" />
                    )}
                    {resetLoading
                      ? "Enviando código..."
                      : resetCooldown > 0
                        ? `Aguarde ${resetCooldown}s`
                        : "Esqueci minha senha"}
                  </button>
                </div>
                <div className="oria-cad-actions" style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <Button variant="secondary" size="lg" type="button" disabled={loading || resetLoading} onClick={() => setStep("phone")}>
                    <Icon name="arrow-up-right" size={18} color="currentColor" style={{ transform: "rotate(-90deg)" }} />
                    Voltar
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    type="button"
                    style={{ flex: 1 }}
                    loading={loading}
                    disabled={resetLoading}
                    onClick={submitSenha}
                    iconRight={<Icon name="arrow-up-right" size={18} color="#f4f2ee" />}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </div>
              </div>
            )}

            {/* REDEFINIR — OTP */}
            {step === "reset-otp" && (
              <div className="oria-step-enter" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--text-secondary)", margin: "-8px 0 0" }}>
                  Para redefinir sua senha, enviamos um código de 6 dígitos para{" "}
                  <strong style={{ color: "var(--text-primary)" }}>{data.telefone}</strong>.
                  <button
                    type="button"
                    onClick={() => setStep("senha")}
                    style={{ background: "none", border: "none", color: "var(--oria-sage)", fontWeight: 600, cursor: "pointer", padding: "0 0 0 6px", fontSize: 14, fontFamily: "var(--font-body)" }}
                  >
                    Cancelar
                  </button>
                </p>
                <OtpInput value={code} onChange={(c) => { setCode(c); setCodeErr(null); }} error={codeErr} />
                {codeErr && <span style={{ fontSize: 12.5, color: CAD_CLAY, marginTop: -8 }}>{codeErr}</span>}
                <Button
                  variant="primary"
                  size="lg"
                  type="button"
                  style={{ width: "100%", marginTop: 2 }}
                  loading={loading}
                  onClick={verifyResetCode}
                  iconRight={<Icon name="shield-check" size={18} color="#f4f2ee" />}
                >
                  {loading ? "Verificando..." : "Verificar e continuar"}
                </Button>
                <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
                  {resend > 0 ? (
                    <span>
                      Reenviar código em <strong style={{ color: "var(--text-secondary)" }}>{resend}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={resendCode}
                      style={{ background: "none", border: "none", color: "var(--oria-sage)", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)" }}
                    >
                      Reenviar código
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* REDEFINIR — nova senha */}
            {step === "reset-senha" && (
              <div className="oria-step-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--text-secondary)", margin: "-8px 0 0" }}>
                  Crie uma nova senha para acessar sua conta com segurança.
                </p>
                <PasswordField
                  name="reset-senha"
                  label="Nova senha"
                  autoFocus
                  autoComplete="new-password"
                  value={resetSenha}
                  onChange={(e) => {
                    setResetSenha(e.target.value);
                    if (resetErr.senha) setResetErr((s) => ({ ...s, senha: cadValSenha(e.target.value) }));
                  }}
                  onBlur={() => setResetErr((s) => ({ ...s, senha: cadValSenha(resetSenha) }))}
                  error={resetErr.senha}
                  helper={resetErr.senha ? undefined : "Mínimo de 8 caracteres, com letras e números."}
                />
                <PasswordField
                  name="reset-senha-confirm"
                  label="Confirmar nova senha"
                  autoComplete="new-password"
                  value={resetSenhaConfirm}
                  onChange={(e) => {
                    setResetSenhaConfirm(e.target.value);
                    if (resetErr.confirm)
                      setResetErr((s) => ({
                        ...s,
                        confirm: !e.target.value
                          ? "Confirme sua senha."
                          : e.target.value !== resetSenha
                            ? "As senhas não coincidem."
                            : null,
                      }));
                  }}
                  onBlur={() =>
                    setResetErr((s) => ({
                      ...s,
                      confirm: !resetSenhaConfirm
                        ? "Confirme sua senha."
                        : resetSenhaConfirm !== resetSenha
                          ? "As senhas não coincidem."
                          : null,
                    }))
                  }
                  error={resetErr.confirm}
                />
                <div className="oria-cad-actions" style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <Button variant="secondary" size="lg" type="button" disabled={loading} onClick={() => setStep("senha")}>
                    <Icon name="arrow-up-right" size={18} color="currentColor" style={{ transform: "rotate(-90deg)" }} />
                    Voltar
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    type="button"
                    style={{ flex: 1 }}
                    loading={loading}
                    onClick={submitReset}
                    iconRight={<Icon name="check" size={18} color="#f4f2ee" />}
                  >
                    {loading ? "Salvando..." : "Redefinir senha"}
                  </Button>
                </div>
              </div>
            )}

            {/* SUCESSO */}
            {step === "done" && (
              <div
                className="oria-step-enter"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  justifyContent: "center",
                  minHeight: 420,
                }}
              >
                <span
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 999,
                    background: "var(--oria-primary)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "var(--shadow-cta)",
                  }}
                >
                  <Icon name="log-in" size={34} color="#f4f2ee" />
                </span>
                <h2 className="oria-headline" style={{ fontSize: "var(--text-2xl)", margin: "28px 0 0", color: "var(--text-primary)" }}>
                  Bem-vindo de volta!
                </h2>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: 360, margin: "14px 0 0" }}>
                  Acesso confirmado para o número <strong style={{ color: "var(--text-primary)" }}>{data.telefone}</strong>. Tudo pronto
                  para acompanhar a história da sua saúde.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  style={{ marginTop: 30 }}
                  onClick={() => {
                    window.open(
                      "https://wa.me/5561998126025?text=Ol%C3%A1%2C%20Oria!",
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                >
                  <Icon name="message-circle" size={19} color="#f4f2ee" />
                  Abrir no WhatsApp
                </Button>
              </div>
            )}
          </div>
          </div>

          {step !== "done" && (
            <div style={{ paddingTop: 24, textAlign: "center", fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>
              © 2026 ORIA · Saúde inteligente
            </div>
          )}
        </div>
      </div>

      <ShortcutsButton onClick={() => setHelpOpen((o) => !o)} />
      <ShortcutsOverlay
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        groups={AUTH_SHORTCUTS}
      />
    </div>
  );
}
