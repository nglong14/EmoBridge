import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { ChatMessage } from "../../lib/api";

type Props = {
  message: ChatMessage;
  isStreaming: boolean;
};

export default function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === "user";

  return (
    <article
      className={`chat-bubble ${isUser ? "chat-bubble--user" : "chat-bubble--assistant"}`}
      aria-label={`${isUser ? "You" : "EmoBridge"} said`}
    >
      <div className="chat-bubble-role">
        {isUser ? "You" : "EmoBridge"}
      </div>
      <div className="chat-bubble-content">
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content || (isStreaming ? "…" : "")}
          </ReactMarkdown>
        )}
        {isStreaming && !isUser && (
          <span className="chat-cursor" aria-hidden="true">|</span>
        )}
      </div>
    </article>
  );
}
