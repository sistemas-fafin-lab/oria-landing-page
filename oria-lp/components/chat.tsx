"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "./parts";
import { GREETING, SUGGESTIONS } from "../lib/oria-assistant";

/* ─────────────────────────────────────────────────────────────
   ORIA — Assistente de IA (copiloto da landing page)
   Chat premium com streaming real via Groq (/api/chat). Substitui
   o antigo botão/modal de "WhatsApp" por um assistente funcional
   que tira dúvidas e guia o usuário em qualquer tarefa do site.
   ───────────────────────────────────────────────────────────── */

type Role = "oria" | "me";
type Status = "idle" | "waiting" | "streaming";

interface Message {
  id: string;
  role: Role;
  text: string;
  error?: boolean;
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const greetingMessage = (): Message => ({
  id: "greeting",
  role: "oria",
  text: GREETING,
});

export function OriaAssistant({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([greetingMessage()]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const busy = status !== "idle";

  // Auto-scroll para a última mensagem enquanto a conversa cresce/streama.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  // Foco no campo + Escape para fechar enquanto o modal está aberto.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => textareaRef.current?.focus(), 120);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Cancela qualquer stream em andamento ao fechar o modal.
  useEffect(() => {
    if (!open && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, [open]);

  const resetTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (el) el.style.height = "auto";
  }, []);

  const growTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 132) + "px";
  }, []);

  const send = useCallback(
    async (raw?: string) => {
      const text = (raw ?? input).trim();
      if (!text || status !== "idle") return;

      const userMsg: Message = { id: uid(), role: "me", text };
      const next = [...messages, userMsg];
      setMessages(next);
      setInput("");
      resetTextarea();
      setStatus("waiting");

      const payload = next
        .filter((m) => !m.error)
        .map((m) => ({
          role: m.role === "me" ? ("user" as const) : ("assistant" as const),
          content: m.text,
        }));

      const controller = new AbortController();
      abortRef.current = controller;
      let assistantId: string | null = null;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: payload }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => null);
          throw new Error(
            data?.error || "Não consegui responder agora. Tente novamente.",
          );
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (!chunk) continue;

          if (assistantId === null) {
            assistantId = uid();
            const id = assistantId;
            setStatus("streaming");
            setMessages((m) => [...m, { id, role: "oria", text: chunk }]);
          } else {
            const id = assistantId;
            setMessages((m) =>
              m.map((x) => (x.id === id ? { ...x, text: x.text + chunk } : x)),
            );
          }
        }

        if (assistantId === null) {
          setMessages((m) => [
            ...m,
            {
              id: uid(),
              role: "oria",
              text: "Desculpe, não consegui gerar uma resposta agora. Pode tentar de novo?",
              error: true,
            },
          ]);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          const msg =
            err instanceof Error
              ? err.message
              : "Tive um problema para responder. Tente novamente em instantes.";
          setMessages((m) => [
            ...m,
            { id: uid(), role: "oria", text: msg, error: true },
          ]);
        }
      } finally {
        setStatus("idle");
        abortRef.current = null;
      }
    },
    [input, messages, status, resetTextarea],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus("idle");
  }, []);

  if (!open) return null;

  const showSuggestions = messages.length === 1 && status === "idle";

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Assistente ORIA"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        background: "rgba(8,15,12,0.55)",
        WebkitBackdropFilter: "blur(8px)",
        backdropFilter: "blur(8px)",
        padding: 20,
        animation: "oria-rise var(--dur-base) var(--ease-out) both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="oria-ai-panel"
        style={{
          width: "min(440px, 100%)",
          height: "min(680px, 88vh)",
          display: "flex",
          flexDirection: "column",
          borderRadius: "var(--radius-bento-lg)",
          overflow: "hidden",
          boxShadow: "var(--shadow-premium)",
          border: "1px solid var(--border-strong)",
          background: "var(--oria-dark-base)",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 13,
            padding: "16px 18px",
            background:
              "linear-gradient(135deg, var(--oria-primary), var(--oria-primary-deep))",
            color: "#f4f2ee",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Avatar />
          <div style={{ lineHeight: 1.25 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                letterSpacing: "0.02em",
                fontSize: 16,
              }}
            >
              ORIA
            </div>
            <div
              style={{
                fontSize: 12,
                opacity: 0.82,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                className="oria-ai-online"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: "#9fe6bd",
                  display: "inline-block",
                }}
              />
              Assistente · online
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar assistente"
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

        {/* ── Mensagens ── */}
        <div
          ref={scrollRef}
          className="oria-ai-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            background:
              "radial-gradient(120% 60% at 50% 0%, rgba(106,138,122,0.10), transparent 60%), var(--oria-dark-base)",
          }}
        >
          {messages.map((m) => (
            <Bubble key={m.id} m={m} />
          ))}
          {status === "waiting" && <TypingBubble />}
        </div>

        {/* ── Sugestões rápidas ── */}
        {showSuggestions && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              padding: "0 14px 12px",
              background: "var(--oria-dark-base)",
            }}
          >
            {SUGGESTIONS.map((s) => (
              <Chip key={s} label={s} onClick={() => send(s)} />
            ))}
          </div>
        )}

        {/* ── Composer ── */}
        <div
          style={{
            padding: "12px 12px 8px",
            background: "var(--oria-dark-surface)",
            borderTop: "1px solid var(--border-strong)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              rows={1}
              onChange={(e) => {
                setInput(e.target.value);
                growTextarea();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Escreva sua mensagem…"
              style={{
                flex: 1,
                resize: "none",
                outline: "none",
                background: "var(--oria-dark-base)",
                color: "var(--oria-light-base)",
                borderRadius: 18,
                padding: "12px 16px",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                lineHeight: 1.5,
                maxHeight: 132,
                border: "1px solid var(--border-strong)",
              }}
            />
            {status === "streaming" ? (
              <button
                onClick={stop}
                aria-label="Parar resposta"
                style={composerBtn("var(--oria-dark-base)")}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: "var(--oria-sage)",
                  }}
                />
              </button>
            ) : (
              <button
                onClick={() => send()}
                disabled={!input.trim() || busy}
                aria-label="Enviar mensagem"
                style={{
                  ...composerBtn("var(--oria-primary)"),
                  opacity: !input.trim() || busy ? 0.5 : 1,
                  cursor: !input.trim() || busy ? "default" : "pointer",
                }}
              >
                <Icon name="send" size={18} color="#f4f2ee" />
              </button>
            )}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              textAlign: "center",
              padding: "8px 6px 2px",
              lineHeight: 1.4,
            }}
          >
            A ORIA tem caráter informativo e complementa — não substitui — o
            cuidado médico.
          </div>
        </div>
      </div>

      <style jsx global>{`
        .oria-ai-panel {
          animation: oria-ai-panel-in 0.42s var(--ease-spring) both;
        }
        @keyframes oria-ai-panel-in {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .oria-ai-msg {
          animation: oria-ai-msg-in 0.34s var(--ease-out) both;
        }
        @keyframes oria-ai-msg-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .oria-ai-online {
          animation: oria-ai-pulse 2.4s ease-in-out infinite;
        }
        @keyframes oria-ai-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(159, 230, 189, 0.6);
          }
          50% {
            box-shadow: 0 0 0 5px rgba(159, 230, 189, 0);
          }
        }
        .oria-ai-dot {
          animation: oria-ai-dot 1.2s ease-in-out infinite;
        }
        .oria-ai-dot:nth-child(2) {
          animation-delay: 0.18s;
        }
        .oria-ai-dot:nth-child(3) {
          animation-delay: 0.36s;
        }
        @keyframes oria-ai-dot {
          0%,
          60%,
          100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }
        .oria-ai-avatar-ring {
          animation: oria-ai-ring 2.6s var(--ease-apple) 1.2s 3;
        }
        @keyframes oria-ai-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(159, 230, 189, 0.5);
          }
          70% {
            box-shadow: 0 0 0 12px rgba(159, 230, 189, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(159, 230, 189, 0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .oria-ai-panel,
          .oria-ai-msg,
          .oria-ai-online,
          .oria-ai-dot,
          .oria-ai-avatar-ring {
            animation: none !important;
          }
        }

        /* ── Premium scrollbar ── */
        .oria-ai-scroll {
          scrollbar-width: thin;
          scrollbar-color: var(--oria-sage) transparent;
        }
        .oria-ai-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .oria-ai-scroll::-webkit-scrollbar-track {
          background: transparent;
          margin: 4px 0;
        }
        .oria-ai-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            var(--oria-sage),
            var(--oria-primary)
          );
          border-radius: 999px;
        }
        .oria-ai-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            var(--oria-primary),
            var(--oria-primary-deep)
          );
        }
      `}</style>
    </div>
  );
}

function composerBtn(bg: string): React.CSSProperties {
  return {
    flexShrink: 0,
    background: bg,
    border: "1px solid var(--border-strong)",
    width: 44,
    height: 44,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "opacity var(--dur-fast) var(--ease-apple)",
  };
}

/* ── Avatar (marca ORIA) ── */
function Avatar() {
  return (
    <span
      className="oria-ai-avatar-ring"
      style={{
        position: "relative",
        width: 40,
        height: 40,
        borderRadius: 999,
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.22)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
      }}
    >
      <span
        style={{ width: 8, height: 18, background: "#dce7dd", borderRadius: 999 }}
      />
      <span
        style={{
          width: 6,
          height: 11,
          background: "#dce7dd",
          borderRadius: 999,
          opacity: 0.8,
        }}
      />
    </span>
  );
}

/* ── Indicador de digitação ── */
function TypingBubble() {
  return (
    <div
      className="oria-ai-msg"
      style={{
        alignSelf: "flex-start",
        display: "inline-flex",
        gap: 5,
        padding: "14px 16px",
        borderRadius: "18px 18px 18px 6px",
        background: "var(--oria-dark-surface)",
        border: "1px solid var(--border-strong)",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="oria-ai-dot"
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            background: "var(--oria-sage)",
            display: "inline-block",
          }}
        />
      ))}
    </div>
  );
}

/* ── Bolha de mensagem ── */
function Bubble({ m }: { m: Message }) {
  const mine = m.role === "me";
  return (
    <div
      className="oria-ai-msg"
      style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "85%" }}
    >
      <div
        style={{
          padding: "11px 15px",
          borderRadius: mine ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
          background: mine
            ? "linear-gradient(135deg, var(--oria-primary), var(--oria-primary-deep))"
            : m.error
              ? "rgba(154,59,46,0.16)"
              : "var(--oria-dark-surface)",
          color: mine ? "#f4f2ee" : "var(--oria-light-base)",
          fontSize: 14,
          lineHeight: 1.55,
          border: mine
            ? "none"
            : m.error
              ? "1px solid rgba(154,59,46,0.4)"
              : "1px solid var(--border-strong)",
          wordBreak: "break-word",
        }}
      >
        <RichText text={m.text} />
      </div>
    </div>
  );
}

/* ── Renderização leve de markdown (negrito, listas, parágrafos) ──
   Evita dependências extras e mantém a saída do modelo legível. */
function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (!list) return;
    const items = list.items;
    blocks.push(
      list.ordered ? (
        <ol key={`ol-${blocks.length}`} style={listStyle}>
          {items.map((it, i) => (
            <li key={i} style={liStyle}>
              {inline(it)}
            </li>
          ))}
        </ol>
      ) : (
        <ul key={`ul-${blocks.length}`} style={listStyle}>
          {items.map((it, i) => (
            <li key={i} style={liStyle}>
              {inline(it)}
            </li>
          ))}
        </ul>
      ),
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (bullet) {
      if (!list || list.ordered) {
        flush();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1]);
    } else if (ordered) {
      if (!list || !list.ordered) {
        flush();
        list = { ordered: true, items: [] };
      }
      list.items.push(ordered[1]);
    } else if (line.trim() === "") {
      flush();
    } else {
      flush();
      blocks.push(
        <p key={`p-${blocks.length}`} style={{ margin: "2px 0" }}>
          {inline(line)}
        </p>,
      );
    }
  }
  flush();

  return <>{blocks}</>;
}

const listStyle: React.CSSProperties = {
  margin: "4px 0",
  paddingLeft: 20,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};
const liStyle: React.CSSProperties = { lineHeight: 1.5 };

/** Negrito inline com **texto**. */
function inline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} style={{ fontWeight: 700 }}>
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

/* ── Chip de sugestão ── */
function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "8px 14px",
        borderRadius: 999,
        border: "1px solid var(--border-strong)",
        background: hover ? "var(--accent-soft)" : "rgba(106,138,122,0.10)",
        color: "var(--oria-light-base)",
        fontFamily: "var(--font-body)",
        fontSize: 12.5,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all var(--dur-fast) var(--ease-apple)",
        transform: hover ? "translateY(-1px)" : "none",
      }}
    >
      {label}
    </button>
  );
}
