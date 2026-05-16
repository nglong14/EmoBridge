import { env } from "../config/index.js";
import { AppError } from "../middleware/error.js";

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = { role: ChatRole; content: string };

export type ChatStreamOptions = {
  signal?: AbortSignal;
  maxNewTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
};

const SSE_DATA_PREFIX = "data: ";
const SSE_DELIMITER = "\n\n";

export async function* chatStream(
  messages: ChatMessage[],
  opts?: ChatStreamOptions,
  fetcher: typeof fetch = fetch,
): AsyncGenerator<string, void, void> {
  const url = `${env.AI_SERVICE_URL}/inference/chat`;

  const max_new_tokens = opts?.maxNewTokens;
  const temperature = opts?.temperature;
  const top_p = opts?.topP;
  const top_k = opts?.topK;

  const response = await fetcher(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      messages,
      ...(max_new_tokens !== undefined && { max_new_tokens }),
      ...(temperature !== undefined && { temperature }),
      ...(top_p !== undefined && { top_p }),
      ...(top_k !== undefined && { top_k }),
    }),
    ...(opts?.signal !== undefined ? { signal: opts.signal } : {} as Record<string, never>),
  });

  if (!response.ok) {
    throw new AppError("AI service unavailable", 502);
  }

  if (!response.body) {
    throw new AppError("AI service returned empty response", 502);
  }

  const reader = response.body.getReader();

  if (!reader) {
    throw new AppError("AI service stream unreadable", 502);
  }

  const decoder = new TextDecoder("utf-8", { fatal: false });
  let buffer = "";
  let exhausted = false;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        if (!exhausted) {
          throw new AppError("AI service stream ended unexpectedly", 502);
        }
        break;
      }

      if (value) {
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split(SSE_DELIMITER);
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith(SSE_DATA_PREFIX)) {
            const json = trimmed.slice(SSE_DATA_PREFIX.length);
            const payload = JSON.parse(json) as Record<string, unknown>;

            if (payload["done"] === true) {
              exhausted = true;
              return;
            }

            const delta = payload["delta"];
            if (typeof delta === "string" && delta.length > 0) {
              yield delta;
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
