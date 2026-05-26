import type { IncomingMessage } from "node:http";
import type { Server as HttpServer } from "node:http";
import type { Duplex } from "node:stream";
import { parse } from "node:url";

import jwt from "jsonwebtoken";
import type { Server } from "ws";
import { WebSocket, WebSocketServer } from "ws";
import { z } from "zod";

import { env } from "../config/index.js";
import { prisma } from "../db/prisma.js";
import { logger } from "../middleware/requestLogger.js";

import { chatStream } from "./aiService.js";
import type { ChatMessage } from "./aiService.js";

type AuthedSocket = WebSocket & {
  userId: string;
  userEmail: string;
  isAlive: boolean;
};

type JwtPayload = {
  sub: string;
  email: string;
};

const wsMessageSchema = z.object({
  type: z.literal("user_message"),
  content: z.string().min(1),
});

type WsIncoming = z.infer<typeof wsMessageSchema>;

type WsOutgoing =
  | { type: "token"; delta: string }
  | { type: "done" }
  | { type: "error"; message: string };

const HISTORY_LIMIT = 20;

const HEARTBEAT_INTERVAL_MS = 30_000;
const HEARTBEAT_TIMEOUT_MS = 60_000;

function send(socket: WebSocket, payload: WsOutgoing): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

// Authenticate user with JWT token
function parseJwt(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof (decoded as Record<string, unknown>)["sub"] !== "string" ||
    typeof (decoded as Record<string, unknown>)["email"] !== "string"
  ) {
    throw new Error("invalid payload");
  }

  return { sub: (decoded as Record<string, string>)["sub"]!, email: (decoded as Record<string, string>)["email"]! };
}

export function attachWebsocket(server: HttpServer): Server {
  // New websocket server, use existing HttpServer
  const wss = new WebSocketServer({ noServer: true });

  let heartbeatInterval: ReturnType<typeof setInterval> | undefined;

  wss.on("close", () => {
    if (heartbeatInterval !== undefined) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = undefined;
    }
  });

  // Upgrade HTTP connection to WebSocket connection, check token in URL
  server.on("upgrade", (request: IncomingMessage, socket: Duplex, head: Buffer) => {
    const url = request.url;

    if (!url || !parse(url).pathname?.startsWith("/ws/chat")) {
      socket.destroy();
      return;
    }

    const parsed = parse(url, true);
    const token = parsed.query["token"];

    if (typeof token !== "string") {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    let payload: JwtPayload;

    try {
      payload = parseJwt(token);
    } catch {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      const authed = ws as AuthedSocket;
      authed.userId = payload.sub;
      authed.userEmail = payload.email;
      authed.isAlive = true;

      wss.emit("connection", authed, request);
    });
  });

  wss.on("connection", (ws: WebSocket) => {
    const authed = ws as AuthedSocket;
    const { userId, userEmail } = authed;

    let turnController: AbortController | null = null;

    // Check connection status
    authed.on("pong", () => {
      authed.isAlive = true;
    });

    // If connection is closed, abort the turn controller
    authed.on("close", () => {
      turnController?.abort();
    });

    // Handle incoming messages
    authed.on("message", async (raw) => {
      let parsed: WsIncoming;

      try {
        parsed = wsMessageSchema.parse(JSON.parse(raw.toString()));
      } catch {
        send(authed, { type: "error", message: "Invalid message format" });
        return;
      }

      if (turnController !== null) {
        send(authed, { type: "error", message: "Previous turn still streaming" });
        return;
      }

      turnController = new AbortController();
      const signal = turnController.signal;
      const content = parsed.content;

      try {
        // Insert user message into Message db
        try {
          await prisma.message.create({
            data: { userId, role: "USER", content },
          });
        } catch (err) {
          logger.error({ err, userId }, "Failed to persist user message");
          send(authed, { type: "error", message: "Failed to save message" });
          return;
        }

        // Conversation history - 20 most recent messages
        let history: ChatMessage[];

        try {
          const rows = await prisma.message.findMany({
            where: { userId },
            orderBy: { createdAt: "asc" },
            take: HISTORY_LIMIT,
            select: { role: true, content: true },
          });

          history = rows.map((row) => ({
            role: row.role.toLowerCase() as ChatMessage["role"],
            content: row.content,
          }));

          if (history.length === 0 || history[0]?.role !== "system") {
            history = [{ role: "system", content: SYSTEM_PROMPT }, ...history];
          }
        } catch (err) {
          logger.error({ err, userId }, "Failed to load message history");
          send(authed, { type: "error", message: "Failed to load history" });
          return;
        }

        // Real-Time Streaming Response
        let full = "";

        try {
          for await (const delta of chatStream(history, { signal })) {
            full += delta;
            send(authed, { type: "token", delta });
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "AI service error";
          logger.error({ err, userId }, "AI stream error");
          send(authed, { type: "error", message });

          // If error occurs during streaming, save the partial response to Postgres
          if (full.length > 0) {
            try {
              await prisma.message.create({
                data: { userId, role: "ASSISTANT", content: full },
              });
            } catch (persistErr) {
              logger.error({ err: persistErr, userId }, "Failed to persist partial assistant message");
            }
          }
          return;
        }

        // If successful, save to Postgres
        if (full.length > 0) {
          try {
            await prisma.message.create({
              data: { userId, role: "ASSISTANT", content: full },
            });
          } catch (err) {
            logger.error({ err, userId }, "Failed to persist assistant message");
            send(authed, { type: "error", message: "Failed to save response" });
            return;
          }
        }

        send(authed, { type: "done" });
      } finally {
        turnController = null;
      }
    });

    logger.info({ userId, userEmail }, "WebSocket connected");
  });

  heartbeatInterval = setInterval(() => {
    for (const client of wss.clients) {
      const authed = client as AuthedSocket;

      if (!authed.isAlive) {
        logger.info({ userId: authed.userId }, "WebSocket heartbeat timeout — terminating");
        authed.terminate();
        continue;
      }

      authed.isAlive = false;
      authed.ping();
    }
  }, HEARTBEAT_INTERVAL_MS);

  return wss;
}

const SYSTEM_PROMPT = `You are EmoBridge, a compassionate and emotionally intelligent companion. Your role is to help users navigate their feelings with empathy, clarity, and practical support.

Guidelines:
- Listen actively and validate the user's emotions without judgment.
- Ask gentle, open-ended questions to help them reflect.
- Offer perspective and reframing when helpful, but never dismiss their feelings.
- Suggest small, actionable steps they can take to feel better.
- Keep responses warm, supportive, and conversational — like a trusted friend.
- NEVER provide medical, clinical, or crisis advice. If someone expresses thoughts of self-harm, gently encourage them to reach out to a trusted person or professional resource.`;
