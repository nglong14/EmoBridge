import { useCallback, useEffect, useRef } from "react";

import Nav from "../components/Nav";
import Composer from "../components/chat/Composer";
import MessageList from "../components/chat/MessageList";
import { api } from "../lib/api";
import { useChat } from "../hooks/useChat";

export default function ChatPage() {
  const { messages, status, errorMsg, streamingIndex, connect, disconnect, send, setMessages } =
    useChat();

  const bottomRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    api
      .listMessages()
      .then(({ messages: history }) => {
        setMessages(history);
        connect();
      })
      .catch(() => {
        connect();
      });
  }, [connect, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isStreaming = streamingIndex !== null;

  const handleClear = useCallback(async () => {
    if (!window.confirm("Clear the entire conversation? This cannot be undone.")) return;
    try {
      await api.clearMessages();
      setMessages([]);
    } catch {
      // silently fail — messages will clear locally regardless
    }
  }, [setMessages]);

  const handleReconnect = useCallback(() => {
    disconnect();
    connect();
  }, [connect, disconnect]);

  return (
    <div className="chat-page">
      <Nav />
      <div className="chat-page-body">
        <div className="chat-header">
          <h1 className="chat-title">Chat</h1>
          <button
            className="button ghost-button chat-clear-btn"
            type="button"
            onClick={handleClear}
            disabled={messages.length === 0}
          >
            Clear conversation
          </button>
        </div>

        <MessageList messages={messages} streamingIndex={streamingIndex} />
        <div ref={bottomRef} />
      </div>

      <Composer
        onSend={send}
        onReconnect={handleReconnect}
        disabled={isStreaming || status === "connecting"}
        status={status}
        errorMsg={errorMsg}
      />
    </div>
  );
}
