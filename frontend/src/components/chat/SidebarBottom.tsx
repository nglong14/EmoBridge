import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function SidebarBottom() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  const initial = user.name?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase() ?? "?";

  return (
    <div className="chat-sidebar-bottom">
      <button
        className="chat-sidebar-theme-btn"
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 1v1M8 14v1M15 8h-1M2 8H1M12.95 3.05l-.7.7M3.75 12.25l-.7.7M12.95 12.95l-.7-.7M3.75 3.75l-.7-.7"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M13 8A5 5 0 118 3a4 4 0 005 5z"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="chat-sidebar-user">
        <div className="chat-sidebar-avatar" aria-hidden="true">
          {initial}
        </div>
        <span className="chat-sidebar-name">{user.name ?? user.email}</span>
      </div>

      <button
        className="chat-sidebar-signout-btn"
        type="button"
        onClick={() => void logout()}
        aria-label="Sign out"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
