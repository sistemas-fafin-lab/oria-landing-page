"use client";

import { useState, useEffect, useRef } from "react";
import { Icon } from "./parts";

interface Message {
  from: "oria" | "me";
  text?: string;
  attachment?: string;
  report?: boolean;
}

export function WhatsAppModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "oria",
      text: "Olá! Sou a ORIA. Envie seus exames em PDF ou foto e eu organizo tudo para você. 🌿",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  function push(msg: Message) {
    setMessages((m) => [...m, msg]);
  }

  function oriaReply(kind: "exam" | "text") {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      if (kind === "exam") {
        push({
          from: "oria",
          text: "Recebi seu exame ✅ Organizando os marcadores e gerando seu relatório…",
          report: true,
        });
      } else {
        push({
          from: "oria",
          text: "Perfeito. Assim que você enviar o arquivo, devolvo um resumo claro, um relatório visual e seu histórico.",
        });
      }
    }, 1100);
  }

  function send() {
    if (!input.trim()) return;
    push({ from: "me", text: input.trim() });
    setInput("");
    oriaReply("text");
  }

  function attach() {
    push({ from: "me", attachment: "hemograma-marina.pdf" });
    oriaReply("exam");
  }

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(8,15,12,0.55)",
        WebkitBackdropFilter: "blur(8px)",
        backdropFilter: "blur(8px)",
        padding: 20,
        animation: "oria-rise var(--dur-base) var(--ease-out) both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(420px, 100%)",
          height: "min(640px, 90vh)",
          display: "flex",
          flexDirection: "column",
          borderRadius: "var(--radius-bento-lg)",
          overflow: "hidden",
          boxShadow: "var(--shadow-premium)",
          border: "1px solid var(--border-strong)",
          background: "var(--oria-dark-base)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 18px",
            background: "var(--oria-primary)",
            color: "#f4f2ee",
          }}
        >
          <span
            style={{ display: "inline-flex", alignItems: "flex-end", gap: 3 }}
          >
            <span
              style={{
                width: 9,
                height: 22,
                background: "#dce7dd",
                borderRadius: 999,
              }}
            />
            <span
              style={{
                width: 7,
                height: 14,
                background: "#dce7dd",
                borderRadius: 999,
                opacity: 0.8,
              }}
            />
          </span>
          <div style={{ lineHeight: 1.2 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              ORIA
            </div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              online · responde em segundos
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              marginLeft: "auto",
              background: "rgba(255,255,255,0.14)",
              border: "none",
              color: "#f4f2ee",
              width: 32,
              height: 32,
              borderRadius: 999,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="x" size={18} color="#f4f2ee" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            background: "var(--oria-dark-base)",
          }}
        >
          {messages.map((m, i) => (
            <Bubble key={i} m={m} />
          ))}
          {typing && (
            <div
              style={{
                alignSelf: "flex-start",
                padding: "12px 16px",
                borderRadius: "18px 18px 18px 6px",
                background: "var(--oria-dark-surface)",
                color: "var(--oria-sage)",
                fontSize: 18,
                letterSpacing: 3,
              }}
            >
              ···
            </div>
          )}
        </div>

        {/* Composer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: 12,
            background: "var(--oria-dark-surface)",
            borderTop: "1px solid var(--border-strong)",
          }}
        >
          <button
            onClick={attach}
            aria-label="Anexar exame"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--oria-sage)",
              display: "inline-flex",
              padding: 8,
            }}
          >
            <Icon name="paperclip" size={20} color="var(--oria-sage)" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Escreva uma mensagem…"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "var(--oria-dark-base)",
              color: "var(--oria-light-base)",
              borderRadius: 999,
              padding: "11px 16px",
              fontFamily: "var(--font-body)",
              fontSize: 14,
            }}
          />
          <button
            onClick={send}
            aria-label="Enviar"
            style={{
              background: "var(--oria-primary)",
              border: "none",
              cursor: "pointer",
              color: "#f4f2ee",
              width: 40,
              height: 40,
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="send" size={18} color="#f4f2ee" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ m }: { m: Message }) {
  const mine = m.from === "me";
  return (
    <div
      style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "82%" }}
    >
      <div
        style={{
          padding: m.attachment ? "12px 14px" : "11px 15px",
          borderRadius: mine ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
          background: mine
            ? "var(--oria-primary)"
            : "var(--oria-dark-surface)",
          color: mine ? "#f4f2ee" : "var(--oria-light-base)",
          fontSize: 14,
          lineHeight: 1.5,
          border: mine ? "none" : "1px solid var(--border-strong)",
        }}
      >
        {m.attachment ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Icon name="file-text" size={22} color="#dce7dd" />
            <span>
              <b style={{ fontWeight: 600 }}>{m.attachment}</b>
              <br />
              <span style={{ fontSize: 12, opacity: 0.8 }}>PDF · 248 KB</span>
            </span>
          </span>
        ) : (
          m.text
        )}
      </div>
      {m.report && <ReportCard />}
    </div>
  );
}

function ReportCard() {
  const rows = [
    { l: "Vitamina D", v: 54, s: "baixa" },
    { l: "HDL", v: 81, s: "adequado" },
    { l: "Glicose", v: 72, s: "ok" },
  ];
  return (
    <div
      style={{
        marginTop: 8,
        padding: 16,
        borderRadius: 18,
        background: "var(--oria-light-base)",
        color: "var(--oria-dark-base)",
        boxShadow: "var(--shadow-premium)",
      }}
    >
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
          fontSize: 17,
          margin: "6px 0 12px",
        }}
      >
        Resumo simplificado
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((r) => (
          <div key={r.l}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                marginBottom: 4,
                color: "var(--text-secondary)",
              }}
            >
              <span>{r.l}</span>
              <span>{r.s}</span>
            </div>
            <div
              style={{
                height: 7,
                borderRadius: 999,
                background: "#e7ece7",
              }}
            >
              <div
                style={{
                  height: 7,
                  borderRadius: 999,
                  width: r.v + "%",
                  background: "var(--oria-primary)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
