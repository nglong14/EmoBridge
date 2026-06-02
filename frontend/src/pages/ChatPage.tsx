import { useCallback, useEffect, useRef, useState } from "react";

import Sidebar from "../components/chat/Sidebar";
import SidebarToggle from "../components/chat/SidebarToggle";
import Topbar from "../components/chat/Topbar";
import Composer from "../components/chat/Composer";
import MessageList from "../components/chat/MessageList";
import { api } from "../lib/api";
import { useChat } from "../hooks/useChat";

export default function ChatPage() {
  const {
    messages,
    status,
    errorMsg,
    streamingIndex,
    currentConversationId,
    refreshSignal,
    connect,
    disconnect,
    send,
    setMessages,
    switchConversation,
    startNewChat,
    setRefreshSignal,
  } = useChat();

  const bottomRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  const [suggestionText, setSuggestionText] = useState<string | undefined>();
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // On initial load: fetch conversations, auto-select the most recent one
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    api
      .listConversations()
      .then(({ conversations }) => {
        if (conversations.length > 0 && conversations[0]) {
          switchConversation(conversations[0].id);
        }
        connect();
      })
      .catch(() => {
        connect();
      });
  }, [connect, switchConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleThreadScroll = useCallback(() => {
    const el = threadRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 150);
  }, []);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBtn(false);
  }, []);

  const handleNewChat = useCallback(() => {
    startNewChat();
  }, [startNewChat]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      switchConversation(id);
    },
    [switchConversation],
  );

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        await api.deleteConversation(id);
      } catch {
        // best-effort
      }

      if (currentConversationId === id) {
        startNewChat();
      }

      setRefreshSignal((s) => s + 1);
    },
    [currentConversationId, startNewChat, setRefreshSignal],
  );

  const handleRenameConversation = useCallback(
    async (id: string, title: string) => {
      try { await api.renameConversation(id, title); } catch {}
      setRefreshSignal((s) => s + 1);
    },
    [setRefreshSignal],
  );

  const handleReconnect = useCallback(() => {
    disconnect();
    connect();
  }, [connect, disconnect]);

  const handleSuggestionClick = useCallback((text: string) => {
    setSuggestionText(text);
  }, []);

  const handleSend = useCallback(
    (content: string) => {
      setSuggestionText(undefined);
      send(content);
    },
    [send],
  );

  const isStreaming = streamingIndex !== null;

  return (
    <div className="chat-shell">
      {sidebarOpen && (
        <>
          <div
            className={`chat-sidebar-overlay ${sidebarOpen ? "chat-sidebar-overlay--visible" : ""}`}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <Sidebar
            activeConversationId={currentConversationId}
            refreshSignal={refreshSignal}
            onNewChat={handleNewChat}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
            onRenameConversation={handleRenameConversation}
          />
        </>
      )}

      <div className="chat-main">
        <Topbar />

        <div
          ref={threadRef}
          className="chat-thread"
          onScroll={handleThreadScroll}
        >
          <div className="chat-thread-header">
            <SidebarToggle
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen((o) => !o)}
            />
          </div>
          <MessageList
            messages={messages}
            streamingIndex={streamingIndex}
            onSuggestionClick={handleSuggestionClick}
          />
          <div ref={bottomRef} />

          {showScrollBtn && (
            <button
              className="chat-scroll-btn"
              type="button"
              onClick={scrollToBottom}
              aria-label="Scroll to bottom"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        <Composer
          onSend={handleSend}
          onReconnect={handleReconnect}
          disabled={isStreaming || status === "connecting"}
          status={status}
          errorMsg={errorMsg}
          defaultValue={suggestionText}
        />
      </div>
    </div>
  );
}
