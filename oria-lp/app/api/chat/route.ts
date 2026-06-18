import { NextRequest } from "next/server";
import {
  ORIA_SYSTEM_PROMPT,
  GROQ_MODEL,
  GROQ_API_URL,
  GENERATION,
  MAX_HISTORY_MESSAGES,
} from "@/lib/oria-assistant";

/* ─────────────────────────────────────────────────────────────
   POST /api/chat
   Proxy server-side para a Groq. A GROQ_API_KEY nunca chega ao
   cliente. Recebe o histórico da conversa, injeta o roteiro da
   ORIA como system prompt e devolve a resposta em streaming
   (texto puro, chunk a chunk) para um efeito de digitação real.
   ───────────────────────────────────────────────────────────── */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MAX_CONTENT_LENGTH = 4000;

/** Mantém apenas mensagens bem formadas, limita tamanho e papéis válidos. */
function sanitizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];
  const cleaned: ChatMessage[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const role = (item as ChatMessage).role;
    const content = (item as ChatMessage).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const trimmed = content.trim();
    if (!trimmed) continue;
    cleaned.push({ role, content: trimmed.slice(0, MAX_CONTENT_LENGTH) });
  }
  // Mantém só as últimas N trocas para controlar custo/contexto.
  return cleaned.slice(-MAX_HISTORY_MESSAGES);
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "O assistente ainda não está configurado. Defina GROQ_API_KEY no .env.local.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const history = sanitizeMessages((body as { messages?: unknown })?.messages);
  if (history.length === 0) {
    return Response.json(
      { error: "Nenhuma mensagem válida foi enviada." },
      { status: 400 },
    );
  }

  let groqResponse: globalThis.Response;
  try {
    groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: ORIA_SYSTEM_PROMPT },
          ...history,
        ],
        stream: true,
        ...GENERATION,
      }),
    });
  } catch (err) {
    console.error("[chat] Falha ao conectar à Groq:", err);
    return Response.json(
      { error: "Não consegui falar com o assistente agora. Tente de novo." },
      { status: 502 },
    );
  }

  if (!groqResponse.ok || !groqResponse.body) {
    const detail = await groqResponse.text().catch(() => "");
    console.error("[chat] Groq retornou erro:", groqResponse.status, detail);
    return Response.json(
      { error: "O assistente está indisponível no momento. Tente novamente." },
      { status: 502 },
    );
  }

  // Transforma o SSE da Groq em um stream de texto puro (apenas os deltas).
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = groqResponse.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // O protocolo SSE separa eventos por linhas em branco.
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const raw of lines) {
            const line = raw.trim();
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const delta: string | undefined =
                json?.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // Fragmento JSON incompleto — ignora e segue acumulando.
            }
          }
        }
      } catch (err) {
        console.error("[chat] Erro lendo stream da Groq:", err);
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
