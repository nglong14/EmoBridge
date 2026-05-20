import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { api, type ChatMessage } from "../lib/api";
import { connectChat, type WsIncoming } from "../lib/chat";

export type ChatStatus = "connecting" | "open" | "closed" | "error";

export function useChat() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("closed");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null);

  const connRef = useRef<ReturnType<typeof connectChat> | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const streamingRef = useRef<string>("");

  messagesRef.current = messages;

  const appendDelta = useCallback((delta: string) => {
    streamingRef.current += delta;
    setMessages((prev) => {
      const next = [...prev];
      if (next.length > 0 && next[next.length - 1]?.role === "assistant") {
        next[next.length - 1] = {
          ...next[next.length - 1]!,
          content: streamingRef.current,
        };
      }
      return next;
    });
  }, []);

  const connect = useCallback(() => {
    if (!token) return;

    setStatus("connecting");
    connRef.current?.close();

    connRef.current = connectChat(
      token,
      {
        onOpen: () => {
          setStatus("open");
        },
        onToken: appendDelta,
        onDone: () => {
          setStreamingIndex(null);
          streamingRef.current = "";
        },
        onError: (msg) => {
          setErrorMsg(msg);
          streamingRef.current = "";
          setStreamingIndex(null);
        },
        onClose: () => {
          setStatus("closed");
        },
      },
      {
        onRetry: async () => {
          try {
            await api.me();
            setStatus("connecting");
          } catch {
            localStorage.removeItem("token");
            navigate("/signin");
          }
        },
        onFail: () => {
          setStatus("error");
          setErrorMsg("Connection lost. Click Reconnect to try again.");
        },
      },
    );

    // status transitions to "open" in onOpen callback above
  }, [token, appendDelta, navigate]);

  const disconnect = useCallback(() => {
    connRef.current?.close();
    connRef.current = null;
    setStatus("closed");
  }, []);

  const send = useCallback(
    (content: string) => {
      if (connRef.current?.getSocket()?.readyState !== WebSocket.OPEN) {
        setErrorMsg("Not connected. Please wait or click Reconnect.");
        return;
      }

      setErrorMsg(null);

      // When sending a new message, if the previous message was an error,
      // clear the error state from previous messages
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      const assistantPlaceholder: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
      setStreamingIndex((prev) => (prev !== null ? prev + 1 : messagesRef.current.length + 1));
      streamingRef.current = "";

      connRef.current?.send({ type: "user_message", content });
    },
    [],
  );

  useEffect(() => {
    return () => {
      connRef.current?.close();
    };
  }, []);

  return {
    messages,
    status,
    errorMsg,
    streamingIndex,
    connect,
    disconnect,
    send,
    setMessages,
  };
}
