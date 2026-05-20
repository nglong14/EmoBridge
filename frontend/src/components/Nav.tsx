import { Link } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

export default function Nav() {
  const { user, logout, isLoading } = useAuth();

  return (
    <nav className="top-nav" aria-label="Main navigation">
      <Link className="brand" to="/" aria-label="EmoBridge home">
        <span className="brand-mark">
          <img src="/logo.png" alt="EmoBridge logo" />
        </span>
        <span>EmoBridge</span>
      </Link>

      <div className="nav-actions">
        {isLoading ? null : user ? (
          <>
            <Link className="button ghost-button" to="/chat">
              Chat
            </Link>
            <Link className="button ghost-button" to="/contacts">
              Contacts
            </Link>
            <span className="nav-username">{user.name ?? user.email}</span>
            <button className="button ghost-button" type="button" onClick={() => void logout()}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link className="button ghost-button" to="/signin">
              Sign in
            </Link>
            <Link className="button primary-button" to="/signup">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
