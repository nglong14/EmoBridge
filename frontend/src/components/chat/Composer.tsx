import { type FormEvent, type KeyboardEvent, useEffect, useRef } from "react";

import type { ChatStatus } from "../../hooks/useChat";

type Props = {
  onSend: (content: string) => void;
  onReconnect: () => void;
  disabled: boolean;
  status: ChatStatus;
  errorMsg: string | null;
  defaultValue?: string;
};

export default function Composer({
  onSend,
  onReconnect,
  disabled,
  status,
  errorMsg,
  defaultValue,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (defaultValue !== undefined && textareaRef.current) {
      textareaRef.current.value = defaultValue;
      textareaRef.current.focus();
    }
  }, [defaultValue]);

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = textareaRef.current?.value.trim();
    if (!value || disabled) return;
    onSend(value);
    if (textareaRef.current) textareaRef.current.value = "";
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  const statusLabel: Record<ChatStatus, string> = {
    connecting: "Connecting",
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

      <div className="chat-composer-box">
        <form className="chat-composer-form" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            rows={1}
            placeholder="Ask anything..."
            disabled={disabled}
            onKeyDown={handleKeyDown}
            aria-label="Message input"
          />
          <div className="chat-composer-toolbar">
            <div className="chat-composer-toolbar-left">
              {(status === "closed" || status === "error") && (
                <button
                  className="chat-composer-tool-btn chat-reconnect-btn"
                  type="button"
                  onClick={onReconnect}
                  aria-label="Reconnect"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 11c.5 2 1.8 3.5 3.5 4M8 2.5A5.5 5.5 0 0113.5 8M14 2v4h-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="chat-composer-toolbar-right">
              <button
                className="chat-send-btn"
                type="submit"
                disabled={disabled}
                aria-label="Send message"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 8h12M10 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="chat-composer-footer">
        <span className={`chat-status chat-status--${statusClass[status]}`}>
          <span className="chat-status-dot" aria-hidden="true" />
          {statusLabel[status]}
        </span>
      </div>
    </div>
  );
}
