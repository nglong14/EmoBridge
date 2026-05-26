import { Link } from "react-router-dom";

type Props = {
  onNewChat: () => void;
};

export default function SidebarTop({ onNewChat }: Props) {
  return (
    <div className="chat-sidebar-top">
      <div className="chat-sidebar-brand">
        <Link className="chat-sidebar-home" to="/" aria-label="EmoBridge home">
          <img className="chat-sidebar-logo" src="/logo.png" alt="EmoBridge logo" />
          <span className="chat-sidebar-logo-text">EmoBridge</span>
        </Link>
      </div>

      <button
        className="chat-new-chat-btn"
        type="button"
        onClick={onNewChat}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8 3v10M3 8h10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        New chat
      </button>
    </div>
  );
}
