"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { Icon, Logo, Button, Badge } from "../../components/parts";
import { Reveal } from "../../components/motion";
import { requestCode, verifyCode, signup, setToken } from "../../lib/auth-client";
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

function cadMaskCPF(v: string) {
  const d = cadDigits(v).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function cadMaskDate(v: string) {
  const d = cadDigits(v).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
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

function cadValNome(v: string): string | null {
  if (!v || !v.trim()) return "Informe seu nome completo.";
  if (v.trim().split(/\s+/).filter((p) => p.length >= 2).length < 2)
    return "Informe nome e sobrenome.";
  return null;
}

function cadValCPF(v: string): string | null {
  const d = cadDigits(v);
  if (!d) return "Informe seu CPF.";
  if (d.length !== 11) return "CPF incompleto.";
  if (/^(\d)\1{10}$/.test(d)) return "CPF inválido.";
  const calc = (len: number) => {
    let s = 0;
    for (let i = 0; i < len; i++) s += parseInt(d[i], 10) * (len + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  if (calc(9) !== +d[9] || calc(10) !== +d[10])
    return "CPF inválido — confira os dígitos.";
  return null;
}

function cadValNasc(v: string): string | null {
  const d = cadDigits(v);
  if (!d) return "Informe sua data de nascimento.";
  if (d.length !== 8) return "Use DD/MM/AAAA.";
  const dia = +d.slice(0, 2);
  const mes = +d.slice(2, 4);
  const ano = +d.slice(4);
  const dt = new Date(ano, mes - 1, dia);
  if (
    dt.getFullYear() !== ano ||
    dt.getMonth() !== mes - 1 ||
    dt.getDate() !== dia ||
    ano < 1900
  )
    return "Data inválida.";
  if (dt > new Date()) return "A data não pode estar no futuro.";
  return null;
}

const CAD_CLAY = "#c4684f";

/* senha: regra e medidor de força */
function cadValSenha(v: string): string | null {
  if (!v) return "Crie uma senha.";
  if (v.length < 8) return "Use ao menos 8 caracteres.";
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v))
    return "Combine letras e números.";
  return null;
}

function cadPassScore(v: string): number {
  if (!v) return 0;
  let s = 0;
  if (v.length >= 8) s++;
  if (v.length >= 12) s++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return Math.min(s, 4);
}

const CAD_STRENGTH = [
  { label: "Fraca", color: CAD_CLAY },
  { label: "Razoável", color: "#c9a227" },
  { label: "Boa", color: "var(--oria-sage)" },
  { label: "Forte", color: "var(--oria-primary)" },
];

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

/* medidor de força da senha (4 barras) */
function StrengthMeter({ value }: { value: string }) {
  const score = cadPassScore(value);
  const idx = Math.max(0, Math.min(3, score - 1));
  const info = CAD_STRENGTH[idx];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 7,
        paddingLeft: 4,
        marginTop: -6,
      }}
    >
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 999,
              background:
                value && i <= idx ? info.color : "var(--border-default)",
              transition: "background var(--dur-base) var(--ease-apple)",
            }}
          />
        ))}
      </div>
      {value ? (
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Força da senha: <strong style={{ color: info.color }}>{info.label}</strong>
        </span>
      ) : null}
    </div>
  );
}

/* ───────────── seleção de sexo ───────────── */
interface SexoPickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

function SexoPicker({ value, onChange, error }: SexoPickerProps) {
  const opts = ["Feminino", "Masculino", "Outro", "Prefiro não informar"];
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (i: number, dir: number) => {
    const ni = (i + dir + opts.length) % opts.length;
    onChange(opts[ni]);
    btnRefs.current[ni]?.focus();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 10.5,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.13em",
          color: error ? CAD_CLAY : "var(--text-muted)",
          paddingLeft: 4,
        }}
      >
        Sexo
      </span>
      <div
        role="radiogroup"
        aria-label="Sexo"
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        {opts.map((o, i) => {
          const on = value === o;
          return (
            <button
              key={o}
              ref={(el) => { btnRefs.current[i] = el; }}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={value ? (on ? 0 : -1) : i === 0 ? 0 : -1}
              onClick={() => onChange(o)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                  e.preventDefault();
                  move(i, 1);
                } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                  e.preventDefault();
                  move(i, -1);
                }
              }}
              style={{
                padding: "11px 18px",
                borderRadius: "var(--radius-pill)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                fontWeight: on ? 600 : 500,
                letterSpacing: "0.01em",
                background: on ? "var(--oria-primary)" : "transparent",
                color: on ? "#f4f2ee" : "var(--text-secondary)",
                border: on ? "1px solid transparent" : "1px solid var(--border-default)",
                boxShadow: on ? "var(--shadow-cta)" : "none",
                transition: "all var(--dur-base) var(--ease-apple)",
              }}
            >
              {o}
            </button>
          );
        })}
      </div>
      {error && (
        <span style={{ fontSize: 12.5, color: CAD_CLAY, paddingLeft: 4 }}>{error}</span>
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

/* ───────────── linha de revisão (passo 3) ───────────── */
function ReviewRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "15px 0",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 38,
          height: 38,
          borderRadius: 12,
          background: "var(--accent-soft)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon as any} size={17} color="var(--accent)" />
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 10.5,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.13em",
            color: "var(--text-muted)",
          }}
        >
          {label}
        </span>
        <span
          style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis" }}
        >
          {value || "—"}
        </span>
      </span>
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

const BrandPanel = memo(function BrandPanel({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
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
            <Badge variant="onDark">{isLogin ? "Entrar" : "Criar conta"}</Badge>
          </div>
          <h1
            className="oria-headline oria-rise oria-cad-brand-title"
            style={{ animationDelay: "140ms", fontSize: "clamp(1.9rem, 1.1rem + 1.6vw + 1vh, 3.25rem)", margin: "clamp(12px, 2vh, 20px) 0 0", maxWidth: 420 }}
          >
            {isLogin ? "Bem-vindo de volta." : "Comece a história da sua saúde."}
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
            {isLogin
              ? "Acesse sua conta com seu telefone e continue acompanhando a história da sua saúde."
              : "Crie sua conta em menos de um minuto e receba um relatório claro, organizado e compreensível dos seus exames — direto no WhatsApp."}
          </p>
        </div>
      </div>

      <div
        className="oria-cad-floats"
        style={{ position: "relative", display: "flex", flexDirection: "column", gap: "clamp(8px, 1.4vh, 14px)", marginTop: "clamp(16px, 3vh, 44px)", paddingTop: 0 }}
      >
        {floats.map((f, i) => (
          <div key={mode + f.t} className="oria-rise" style={{ animationDelay: `${360 + i * 120}ms` }}>
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
const SIGNUP_SHORTCUTS: ShortcutGroup[] = [
  {
    heading: "Formulário",
    items: [
      { keys: ["Enter"], label: "Avançar / confirmar" },
      { keys: ["Esc"], label: "Voltar à etapa anterior" },
      { keys: ["←", "→"], label: "Escolher o sexo (com o seletor em foco)" },
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

/* ───────────── app de cadastro ───────────── */
export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp" | "dados" | "senha" | "review" | "done">("phone");
  const [data, setData] = useState({
    telefone: "",
    nome: "",
    cpf: "",
    nascimento: "",
    sexo: "",
    senha: "",
    senhaConfirm: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // otp state
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState<string | null>(null);
  const [resend, setResend] = useState(0);
  const [loading, setLoading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const { shortcutsEnabled } = useAccessibility();

  // tema global (claro/escuro/sistema) — compartilhado com todo o site
  const { isDark, toggle: toggleTheme } = useTheme();
  const theme = isDark ? "dark" : "light";

  const masks = { telefone: cadMaskPhone, cpf: cadMaskCPF, nascimento: cadMaskDate };
  const vals = { telefone: cadValPhone, nome: cadValNome, cpf: cadValCPF, nascimento: cadValNasc };

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const raw = typeof e === "string" ? e : e.target.value;
    const v = masks[f as keyof typeof masks] ? (masks[f as keyof typeof masks] as any)(raw) : raw;
    setData((s) => ({ ...s, [f]: v }));
    if (touched[f])
      setErrors((s) => ({ ...s, [f]: vals[f as keyof typeof vals]?.(v) || null }));
  };

  const blur = (f: string) => () => {
    setTouched((s) => ({ ...s, [f]: true }));
    setErrors((s) => ({ ...s, [f]: vals[f as keyof typeof vals]?.(data[f as keyof typeof data]) || null }));
  };

  const ok = (f: string): boolean | undefined => touched[f] && !errors[f] && !!data[f as keyof typeof data];

  // senha handlers
  const setSenha = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setData((s) => ({ ...s, senha: v }));
    if (touched.senha) setErrors((s) => ({ ...s, senha: cadValSenha(v) }));
  };

  const setSenhaConfirm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setData((s) => ({ ...s, senhaConfirm: v }));
    if (touched.senhaConfirm)
      setErrors((s) => ({
        ...s,
        senhaConfirm: !v ? "Confirme sua senha." : v !== data.senha ? "As senhas não coincidem." : null,
      }));
  };

  const blurSenha = () => {
    setTouched((s) => ({ ...s, senha: true }));
    setErrors((s) => ({ ...s, senha: cadValSenha(data.senha) }));
  };

  const blurSenhaConfirm = () => {
    setTouched((s) => ({ ...s, senhaConfirm: true }));
    setErrors((s) => ({
      ...s,
      senhaConfirm: !data.senhaConfirm
        ? "Confirme sua senha."
        : data.senhaConfirm !== data.senha
          ? "As senhas não coincidem."
          : null,
    }));
  };

  // resend countdown
  useEffect(() => {
    if (resend <= 0) return;
    const t = setTimeout(() => setResend((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resend]);

  const sendCode = async () => {
    if (loading) return;
    const err = cadValPhone(data.telefone);
    setTouched((s) => ({ ...s, telefone: true }));
    setErrors((s) => ({ ...s, telefone: err }));
    if (err) return;

    setLoading(true);
    const result = await requestCode(data.telefone);
    setLoading(false);

    if (!result.ok) {
      setErrors((s) => ({ ...s, telefone: result.error || "Erro ao enviar código" }));
      return;
    }

    setCode("");
    setCodeErr(null);
    setResend(30);
    setStep("otp");
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

    setCodeErr(null);
    setStep("dados");
  };

  const submitDados = () => {
    const next = {
      nome: cadValNome(data.nome),
      cpf: cadValCPF(data.cpf),
      nascimento: cadValNasc(data.nascimento),
      sexo: data.sexo ? null : "Selecione uma opção.",
    };
    setErrors((s) => ({ ...s, ...next }));
    setTouched((s) => ({ ...s, nome: true, cpf: true, nascimento: true, sexo: true }));
    if (Object.values(next).every((v) => !v)) setStep("senha");
  };

  const submitSenha = () => {
    const e1 = cadValSenha(data.senha);
    const e2 = !data.senhaConfirm
      ? "Confirme sua senha."
      : data.senhaConfirm !== data.senha
        ? "As senhas não coincidem."
        : null;
    setTouched((s) => ({ ...s, senha: true, senhaConfirm: true }));
    setErrors((s) => ({ ...s, senha: e1, senhaConfirm: e2 }));
    if (!e1 && !e2) setStep("review");
  };

  const submitReview = async () => {
    if (loading) return;
    setLoading(true);
    const result = await signup({
      phone: data.telefone,
      nome: data.nome,
      cpf: data.cpf,
      nascimento: data.nascimento,
      sexo: data.sexo,
      senha: data.senha,
    });
    setLoading(false);

    if (result.ok && result.user?.token) {
      setToken(result.user.token);
      setStep("done");
    } else {
      setErrors((s) => ({ ...s, general: result.error || "Erro ao criar conta" }));
    }
  };

  useKeydown((e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Escape") {
      if (helpOpen) { setHelpOpen(false); return; }
      if (!shortcutsEnabled) return;
      if (step === "otp") { e.preventDefault(); setStep("phone"); }
      else if (step === "dados") { e.preventDefault(); setStep("otp"); }
      else if (step === "senha") { e.preventDefault(); setStep("dados"); }
      else if (step === "review") { e.preventDefault(); setStep("senha"); }
      return;
    }
    if (!shortcutsEnabled) return;
    if (isTypingTarget(e.target)) {
      if (e.key === "Enter") {
        if (step === "phone") { e.preventDefault(); sendCode(); }
        else if (step === "otp") { e.preventDefault(); handleVerifyCode(); }
        else if (step === "dados") { e.preventDefault(); submitDados(); }
        else if (step === "senha") { e.preventDefault(); submitSenha(); }
      }
      return;
    }
    if (e.key === "?") { e.preventDefault(); setHelpOpen((o) => !o); }
  });

  const stepNum = step === "dados" ? 2 : step === "senha" ? 3 : step === "review" ? 4 : 1;
  const labels = {
    phone: "Seu telefone",
    otp: "Verifique seu número",
    dados: "Seus dados",
    senha: "Crie sua senha",
    review: "Confirme e crie sua conta",
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
        <BrandPanel mode="signup" />

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
              <StepHeader step={stepNum} total={4} label={labels[step]} showSteps={true} />
            )}

            {/* PASSO 1 — telefone */}
            {step === "phone" && (
              <div key="phone" className="oria-step-enter" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <Field
                  name="cad-telefone"
                  label="Telefone (WhatsApp)"
                  inputMode="tel"
                  maxLength={15}
                  autoComplete="tel-national"
                  autoFocus
                  value={data.telefone}
                  onChange={set("telefone")}
                  onBlur={blur("telefone")}
                  error={touched.telefone ? errors.telefone : null}
                  valid={ok("telefone")}
                  helper="Enviaremos um código de verificação por SMS / WhatsApp."
                />
                <Button
                  variant="primary"
                  size="lg"
                  type="button"
                  style={{ width: "100%", marginTop: 6 }}
                  loading={loading}
                  onClick={sendCode}
                  iconRight={<Icon name="arrow-up-right" size={18} color="#f4f2ee" />}
                >
                  {loading ? "Enviando código..." : "Enviar código"}
                </Button>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--text-muted)", justifyContent: "center", marginTop: 4 }}>
                  <span>Já tem conta?</span>
                  <button type="button" onClick={() => router.push("/login")} style={authLink}>
                    Entrar
                  </button>
                </div>
              </div>
            )}

            {/* PASSO 1b — OTP */}
            {step === "otp" && (
              <div className="oria-step-enter" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--text-secondary)", margin: "-8px 0 0" }}>
                  Enviamos um código de 6 dígitos para{" "}
                  <strong style={{ color: "var(--text-primary)" }}>{data.telefone}</strong>.
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
                      onClick={() => {
                        setResend(30);
                        setCode("");
                      }}
                      style={{ background: "none", border: "none", color: "var(--oria-sage)", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)" }}
                    >
                      Reenviar código
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* PASSO 2 — dados */}
            {step === "dados" && (
              <div className="oria-step-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                  <Icon name="check" size={17} color="var(--accent)" />
                  <span style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
                    Telefone <strong style={{ color: "var(--text-primary)" }}>{data.telefone}</strong> verificado.
                  </span>
                </div>
                <Field
                  name="cad-nome"
                  label="Nome completo"
                  autoComplete="name"
                  autoFocus
                  value={data.nome}
                  onChange={set("nome")}
                  onBlur={blur("nome")}
                  error={touched.nome ? errors.nome : null}
                  valid={ok("nome")}
                />
                <div className="oria-cad-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field
                    name="cad-cpf"
                    label="CPF"
                    inputMode="numeric"
                    maxLength={14}
                    value={data.cpf}
                    onChange={set("cpf")}
                    onBlur={blur("cpf")}
                    error={touched.cpf ? errors.cpf : null}
                    valid={ok("cpf")}
                  />
                  <Field
                    name="cad-nascimento"
                    label="Data de nascimento"
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="bday"
                    value={data.nascimento}
                    onChange={set("nascimento")}
                    onBlur={blur("nascimento")}
                    error={touched.nascimento ? errors.nascimento : null}
                    valid={ok("nascimento")}
                  />
                </div>
                <SexoPicker
                  value={data.sexo}
                  onChange={(v) => {
                    setData((s) => ({ ...s, sexo: v }));
                    setTouched((s) => ({ ...s, sexo: true }));
                    setErrors((s) => ({ ...s, sexo: null }));
                  }}
                  error={touched.sexo ? errors.sexo : null}
                />
                <div className="oria-cad-actions" style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <Button variant="secondary" size="lg" type="button" onClick={() => setStep("otp")}>
                    <Icon name="arrow-up-right" size={18} color="currentColor" style={{ transform: "rotate(-90deg)" }} />
                    Voltar
                  </Button>
                  <Button variant="primary" size="lg" type="button" style={{ flex: 1 }} onClick={submitDados}>
                    Continuar
                    <Icon name="arrow-up-right" size={18} color="#f4f2ee" />
                  </Button>
                </div>
              </div>
            )}

            {/* PASSO 3 — senha */}
            {step === "senha" && (
              <div className="oria-step-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--text-secondary)", margin: "-8px 0 0" }}>
                  Crie uma senha para acessar sua conta com segurança sempre que quiser.
                </p>
                <PasswordField
                  name="cad-senha"
                  label="Senha"
                  autoFocus
                  autoComplete="new-password"
                  value={data.senha}
                  onChange={setSenha}
                  onBlur={blurSenha}
                  error={touched.senha ? errors.senha : null}
                  helper={touched.senha && errors.senha ? undefined : "Mínimo de 8 caracteres, com letras e números."}
                />
                <StrengthMeter value={data.senha} />
                <PasswordField
                  name="cad-senha-confirm"
                  label="Confirmar senha"
                  autoComplete="new-password"
                  value={data.senhaConfirm}
                  onChange={setSenhaConfirm}
                  onBlur={blurSenhaConfirm}
                  error={touched.senhaConfirm ? errors.senhaConfirm : null}
                />
                <div className="oria-cad-actions" style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <Button variant="secondary" size="lg" type="button" onClick={() => setStep("dados")}>
                    <Icon name="arrow-up-right" size={18} color="currentColor" style={{ transform: "rotate(-90deg)" }} />
                    Voltar
                  </Button>
                  <Button variant="primary" size="lg" type="button" style={{ flex: 1 }} onClick={submitSenha}>
                    Continuar
                    <Icon name="arrow-up-right" size={18} color="#f4f2ee" />
                  </Button>
                </div>
              </div>
            )}

            {/* PASSO 4 — revisão */}
            {step === "review" && (
              <div className="oria-step-enter" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--text-secondary)", margin: "-8px 0 8px" }}>
                  Confira seus dados antes de criar a conta.
                </p>
                <ReviewRow icon="phone" label="Telefone" value={data.telefone} />
                <ReviewRow icon="user-round" label="Nome completo" value={data.nome} />
                <ReviewRow icon="id-card" label="CPF" value={data.cpf} />
                <ReviewRow icon="calendar-clock" label="Data de nascimento" value={data.nascimento} />
                <ReviewRow icon="users-round" label="Sexo" value={data.sexo} />
                <ReviewRow icon="lock" label="Senha" value={data.senha ? "•".repeat(Math.min(data.senha.length, 12)) : "—"} />
                <p
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 9,
                    fontSize: 12.5,
                    lineHeight: 1.55,
                    color: "var(--text-muted)",
                    margin: "18px 0 0",
                  }}
                >
                  <Icon name="lock" size={14} color="var(--oria-sage)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>
                    Ao criar a conta você concorda com os Termos de Uso e a Política de Privacidade. Seus dados são usados apenas para
                    organizar seus exames.
                  </span>
                </p>
                <div className="oria-cad-actions" style={{ display: "flex", gap: 12, marginTop: 22 }}>
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
                    onClick={submitReview}
                    iconRight={<Icon name="check" size={18} color="#f4f2ee" />}
                  >
                    {loading ? "Criando conta..." : "Criar minha conta"}
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
                  <Icon name="check" size={34} color="#f4f2ee" />
                </span>
                <h2 className="oria-headline" style={{ fontSize: "var(--text-2xl)", margin: "28px 0 0", color: "var(--text-primary)" }}>
                  Conta criada!
                </h2>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: 360, margin: "14px 0 0" }}>
                  Olá, <strong style={{ color: "var(--text-primary)" }}>{(data.nome.split(" ")[0]) || ""}</strong>. Em instantes
                  você recebe uma mensagem da ORIA no{" "}
                  <strong style={{ color: "var(--text-primary)" }}>{data.telefone}</strong> para enviar seu primeiro exame.
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
        groups={SIGNUP_SHORTCUTS}
      />
    </div>
  );
}
