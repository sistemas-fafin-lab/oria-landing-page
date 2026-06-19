import { NextRequest } from "next/server";
import {
  ORIA_SYSTEM_PROMPT,
  getAIConfig,
  getFallbackAIConfig,
  getGeneration,
  MAX_HISTORY_MESSAGES,
  type AIConfig,
} from "@/lib/oria-assistant";

/* ─────────────────────────────────────────────────────────────
   POST /api/chat
   Proxy server-side para Google Gemini (principal) ou Groq
   (fallback). As chaves de API nunca chegam ao cliente.
   Recebe o histórico da conversa, injeta o roteiro da ORIA
   como system prompt e devolve a resposta em streaming
   (texto puro, chunk a chunk) para efeito de digitação real.

   Ambos os providers usam endpoints compatíveis com OpenAI —
   o formato SSE e a estrutura JSON de resposta são idênticos.
   ───────────────────────────────────────────────────────────── */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MAX_CONTENT_LENGTH = 4000;

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
  return cleaned.slice(-MAX_HISTORY_MESSAGES);
}

async function streamFromProvider(
  config: AIConfig,
  history: ChatMessage[],
  label: string,
): Promise<globalThis.Response> {
  const res = await fetch(config.apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: ORIA_SYSTEM_PROMPT },
        ...history,
      ],
      stream: true,
      ...getGeneration(),
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    console.error(`[chat] ${label} erro ${res.status}:`, detail);
    throw new Error(`${label} indisponível (${res.status})`);
  }

  return res;
}

function createTextStream(providerResponse: globalThis.Response): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = providerResponse.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

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
        console.error("[chat] Erro lendo stream:", err);
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });
}

export async function POST(request: NextRequest) {
  const primary = getAIConfig();
  if (!primary.apiKey) {
    return Response.json(
      {
        error:
          "O assistente ainda não está configurado. Defina GEMINI_API_KEY ou GROQ_API_KEY no .env.local.",
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

  // Tenta o provider principal; se falhar, tenta o fallback.
  let providerResponse: globalThis.Response;
  try {
    providerResponse = await streamFromProvider(primary, history, primary.model);
  } catch (err) {
    console.error("[chat] Provider principal falhou, tentando fallback:", err);

    const fallback = getFallbackAIConfig();
    if (!fallback.apiKey) {
      return Response.json(
        { error: "O assistente está indisponível no momento. Tente novamente." },
        { status: 502 },
      );
    }

    try {
      providerResponse = await streamFromProvider(
        fallback,
        history,
        fallback.model,
      );
    } catch (fbErr) {
      console.error("[chat] Fallback também falhou:", fbErr);
      return Response.json(
        { error: "O assistente está indisponível no momento. Tente novamente." },
        { status: 502 },
      );
    }
  }

  const stream = createTextStream(providerResponse);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
