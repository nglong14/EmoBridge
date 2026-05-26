import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { ChatMessage } from "../../lib/api";

type Props = {
  message: ChatMessage;
  isStreaming: boolean;
};

function TypingDots() {
  return (
    <span className="chat-typing" aria-label="Typing">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </span>
  );
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [message.content]);

  const isEmpty = message.content.length === 0;

  return (
    <div
      className={`chat-thread-message ${isUser ? "chat-thread-message--user" : "chat-thread-message--assistant"}`}
    >
      <div className="chat-thread-message-inner">
        {!isUser && (
          <div className="chat-thread-avatar" aria-hidden="true">
            E
          </div>
        )}

        <div className="chat-thread-message-body">
          <div className="chat-thread-message-content">
            {isEmpty && isStreaming ? (
              <TypingDots />
            ) : isUser ? (
              <span>{message.content}</span>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            )}
          </div>

          {!isEmpty && !isStreaming && (
            <div className="chat-thread-message-actions">
              <button
                className="chat-copy-btn"
                type="button"
                onClick={handleCopy}
                aria-label={copied ? "Copied" : "Copy message"}
                title={copied ? "Copied" : "Copy"}
              >
                {copied ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 7l3.5 3.5L12 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="8"
                      height="8"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M2 10V3a1 1 0 011-1h7"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>

        {isUser && (
          <div className="chat-thread-avatar chat-thread-avatar--user" aria-hidden="true">
            Y
          </div>
        )}
      </div>
    </div>
  );
}
