import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function Nav() {
  const { user, logout, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <nav className="top-nav" aria-label="Main navigation">
      <Link className="brand" to="/" aria-label="EmoBridge home">
        <span className="brand-mark">
          <img src="/logo.png" alt="EmoBridge logo" />
        </span>
        <span>EmoBridge</span>
      </Link>

      <button
        className={`nav-hamburger${mobileOpen ? " nav-hamburger--open" : ""}`}
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        aria-expanded={mobileOpen}
        aria-label="Toggle navigation menu"
      >
        <span className="nav-hamburger-line" />
        <span className="nav-hamburger-line" />
        <span className="nav-hamburger-line" />
      </button>

      <div className={`nav-actions${mobileOpen ? " nav-actions--open" : ""}`}>
        <button
          className="nav-theme-btn"
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

        {isLoading ? null : user ? (
          <>
            <Link className="button ghost-button" to="/chat" onClick={closeMobile}>
              Chat
            </Link>
            <Link className="button ghost-button" to="/contacts" onClick={closeMobile}>
              Contacts
            </Link>
            <span className="nav-username">{user.name ?? user.email}</span>
            <button className="button ghost-button" type="button" onClick={() => { closeMobile(); void logout(); }}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link className="button ghost-button" to="/signin" onClick={closeMobile}>
              Sign in
            </Link>
            <Link className="button primary-button" to="/signup" onClick={closeMobile}>
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
