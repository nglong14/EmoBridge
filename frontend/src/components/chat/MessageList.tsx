import type { ChatMessage } from "../../lib/api";
import MessageBubble from "./MessageBubble";

type Props = {
  messages: ChatMessage[];
  streamingIndex: number | null;
  onSuggestionClick: (text: string) => void;
};

const SUGGESTIONS = [
  { label: "Help me express how I feel", tint: "peach" },
  { label: "Guide me through a tough conversation", tint: "mint" },
  { label: "Reflect on my emotions", tint: "lavender" },
];

export default function MessageList({
  messages,
  streamingIndex,
  onSuggestionClick,
}: Props) {
  if (messages.length === 0) {
    return (
      <div className="chat-empty">
        <div className="chat-empty-logo">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
            <path
              d="M10 14c.5-3 3-5 6-5s5.5 2 6 5M10 22c.5 3 3 5 6 5s5.5-2 6-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="chat-empty-title">How can I help you today?</p>
        <div className="chat-suggestions">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              className={`chat-suggestion-chip chat-suggestion-chip--${s.tint}`}
              onClick={() => onSuggestionClick(s.label)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="chat-thread-messages"
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      {messages.map((msg, i) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isStreaming={i === streamingIndex}
        />
      ))}
    </div>
  );
}
