import "server-only";

export class GroqError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const BASE_URL = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";

export const MODELS = {
  strategist: process.env.GROQ_STRATEGIST_MODEL || "llama-3.3-70b-versatile",
  specialist: process.env.GROQ_SPECIALIST_MODEL || "llama-3.1-8b-instant",
};

/** One chat completion on Groq's OpenAI-compatible API. Server only: the key never reaches the browser. */
export async function groqChat(opts: {
  model: string;
  messages: ChatMessage[];
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new GroqError("GROQ_API_KEY is not set on the server.", 500);

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      max_tokens: opts.maxTokens ?? 700,
      temperature: opts.temperature ?? 0.3,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: opts.signal,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429) {
      throw new GroqError("The board is busy right now (Groq free-tier limit). Please try again in a minute.", 429);
    }
    throw new GroqError(`Groq request failed (${res.status}). ${detail.slice(0, 200)}`, res.status);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

/** Parse a JSON object from a model reply, tolerating code fences or extra text around it. */
export function parseJsonObject<T>(text: string): T | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
