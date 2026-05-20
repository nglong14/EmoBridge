import type { ChatMessage } from "../../lib/api";
import MessageBubble from "./MessageBubble";

type Props = {
  messages: ChatMessage[];
  streamingIndex: number | null;
};

export default function MessageList({ messages, streamingIndex }: Props) {
  if (messages.length === 0) {
    return (
      <div className="chat-empty">
        <p className="chat-empty-title">Start the conversation</p>
        <p className="chat-empty-sub">Type a message below to begin — EmoBridge is here to listen.</p>
      </div>
    );
  }

  return (
    <div className="chat-messages" role="log" aria-label="Chat messages" aria-live="polite">
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
