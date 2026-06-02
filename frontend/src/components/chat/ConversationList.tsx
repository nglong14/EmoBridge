import { useEffect, useRef, useState } from "react";

import { api, type Conversation } from "../../lib/api";

type Props = {
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  refreshSignal: number;
};

export default function ConversationList({ activeId, onSelect, onDelete, onRename, refreshSignal }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .listConversations()
      .then(({ conversations: list }) => setConversations(list))
      .catch(() => {});
  }, [refreshSignal]);

  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);

  const startRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const cancelRename = () => {
    setEditingId(null);
  };

  const commitRename = (id: string) => {
    const trimmed = editTitle.trim();
    if (trimmed) onRename(id, trimmed);
    setEditingId(null);
  };

  if (conversations.length === 0) {
    return (
      <div className="chat-conversation-list">
        <p className="chat-conversation-empty">No conversations yet.</p>
      </div>
    );
  }

  return (
    <div className="chat-conversation-list">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          className={`chat-conversation-item ${conv.id === activeId ? "chat-conversation-item--active" : ""}`}
        >
          {editingId === conv.id ? (
            <input
              ref={inputRef}
              className="chat-conversation-rename-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename(conv.id);
                if (e.key === "Escape") cancelRename();
              }}
              onBlur={() => commitRename(conv.id)}
            />
          ) : (
            <>
              <button
                type="button"
                className="chat-conversation-btn"
                onClick={() => onSelect(conv.id)}
                title={conv.title}
              >
                <span className="chat-conversation-title">{conv.title}</span>
              </button>
              <button
                type="button"
                className="chat-conversation-rename"
                onClick={(e) => { e.stopPropagation(); startRename(conv); }}
                aria-label={`Rename ${conv.title}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="chat-conversation-delete"
                onClick={() => onDelete(conv.id)}
                aria-label={`Delete ${conv.title}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M4 4l6 6M10 4l-6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
