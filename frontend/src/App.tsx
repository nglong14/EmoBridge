import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const featureCards = [
  {
    title: "Emotion-aware prompts",
    body: "Turn rough thoughts into clear messages with tone cues, reflection questions, and gentle rewrites.",
    className: "feature-card peach",
  },
  {
    title: "Shared context",
    body: "Keep both sides aligned with conversation summaries that highlight needs, boundaries, and next steps.",
    className: "feature-card mint",
  },
  {
    title: "Support in the moment",
    body: "Use lightweight guidance before difficult conversations, check-ins, or relationship repairs.",
    className: "feature-card lavender",
  },
];

function Nav() {
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
            <span className="nav-username">{user.name ?? user.email}</span>
            <button
              className="button ghost-button"
              type="button"
              onClick={() => void logout()}
            >
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

function LandingPage() {
  const { user, isLoading } = useAuth();

  return (
    <main className="landing-page">
      <Nav />

      <section className="hero-band">
        <div className="decor-dot dot-pink" />
        <div className="decor-dot dot-green" />
        <div className="decor-dot dot-yellow" />
        <div className="wire-card wire-one" />
        <div className="wire-card wire-two" />

        <div className="hero-content">
          <p className="eyebrow">Feelings, translated with care</p>
          <h1>EmoBridge</h1>
          <p className="hero-description">
            EmoBridge helps people communicate emotions with clarity, empathy, and practical next
            steps so hard conversations feel easier to begin.
          </p>

          <div className="hero-actions">
            {!isLoading && !user && (
              <Link className="button primary-button" to="/signup">
                Sign up
              </Link>
            )}
            <a className="button secondary-on-dark" href="#learn-more">
              Learn more
            </a>
          </div>
        </div>

        <section className="workspace-mockup" aria-label="EmoBridge workspace preview">
          <div className="mockup-sidebar">
            <span className="sidebar-dot active" />
            <span className="sidebar-line long" />
            <span className="sidebar-line" />
            <span className="sidebar-line medium" />
          </div>
          <div className="mockup-board">
            <div className="mockup-header">
              <span>Conversation plan</span>
              <span className="status-pill">Ready</span>
            </div>
            <div className="mockup-columns">
              <article>
                <span className="tag rose">Feeling</span>
                <strong>Overwhelmed</strong>
                <p>I need more patience and a calmer way to explain this.</p>
              </article>
              <article>
                <span className="tag sky">Message</span>
                <strong>Draft with empathy</strong>
                <p>Here is what I am feeling, and here is what would help.</p>
              </article>
              <article>
                <span className="tag green">Next step</span>
                <strong>Check in tonight</strong>
                <p>Ask one open question and agree on a small follow-up.</p>
              </article>
            </div>
          </div>
        </section>
      </section>

      <section className="feature-section" id="learn-more">
        <div className="feature-banner">
          <p className="eyebrow dark">Built for emotionally honest communication</p>
          <h2>Bridge the gap between what you feel and what you say.</h2>
        </div>

        <div className="feature-grid">
          {featureCards.map((feature) => (
            <article className={feature.className} key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function AuthRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/signin"
            element={
              <AuthRouteGuard>
                <LoginPage />
              </AuthRouteGuard>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRouteGuard>
                <RegisterPage />
              </AuthRouteGuard>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
