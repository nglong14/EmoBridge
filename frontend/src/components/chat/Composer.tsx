import { type FormEvent, type KeyboardEvent, useRef } from "react";

import type { ChatStatus } from "../../hooks/useChat";

type Props = {
  onSend: (content: string) => void;
  onReconnect: () => void;
  disabled: boolean;
  status: ChatStatus;
  errorMsg: string | null;
};

export default function Composer({ onSend, onReconnect, disabled, status, errorMsg }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = textareaRef.current?.value.trim();
    if (!value || disabled) return;
    onSend(value);
    if (textareaRef.current) textareaRef.current.value = "";
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  const statusLabel: Record<ChatStatus, string> = {
    connecting: "Connecting…",
    open: "Connected",
    closed: "Disconnected",
    error: "Error",
  };

  const statusClass: Record<ChatStatus, string> = {
    connecting: "connecting",
    open: "open",
    closed: "closed",
    error: "error",
  };

  return (
    <div className="chat-composer">
      {errorMsg && (
        <p className="chat-error" role="alert">
          {errorMsg}
        </p>
      )}
      <form className="chat-composer-form" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          rows={1}
          placeholder="Type a message…"
          disabled={disabled}
          onKeyDown={handleKeyDown}
          aria-label="Message input"
        />
        <button
          className="button primary-button chat-send-btn"
          type="submit"
          disabled={disabled}
        >
          Send
        </button>
      </form>
      <div className="chat-composer-footer">
        <span className={`chat-status chat-status--${statusClass[status]}`}>
          <span className="chat-status-dot" aria-hidden="true" />
          {statusLabel[status]}
        </span>
        {status === "closed" || status === "error" ? (
          <button
            className="button ghost-button chat-reconnect-btn"
            type="button"
            onClick={onReconnect}
          >
            Reconnect
          </button>
        ) : null}
        <span className="chat-hint">Enter to send, Shift+Enter for new line</span>
      </div>
    </div>
  );
}
