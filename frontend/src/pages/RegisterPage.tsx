import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldIssues, setFieldIssues] = useState<{ path: string; message: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function getIssue(field: string): string | undefined {
    return fieldIssues.find((i) => i.path === field)?.message;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldIssues([]);
    setSubmitting(true);
    try {
      await register(email, password, name.trim() || undefined);
      navigate("/chat");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldIssues(err.issues ?? []);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          EmoBridge
        </Link>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start bridging emotions with clarity.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <label className="field-label" htmlFor="name">
            Name <span className="field-optional">(optional)</span>
          </label>
          <input
            id="name"
            className="text-input"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            aria-invalid={getIssue("name") ? true : undefined}
            aria-describedby={getIssue("name") ? "name-hint" : undefined}
          />
          {getIssue("name") && (
            <p id="name-hint" className="field-hint" role="alert">
              {getIssue("name")}
            </p>
          )}

          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="text-input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={getIssue("email") ? true : undefined}
            aria-describedby={getIssue("email") ? "email-hint" : undefined}
          />
          {getIssue("email") && (
            <p id="email-hint" className="field-hint" role="alert">
              {getIssue("email")}
            </p>
          )}

          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="text-input"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            aria-invalid={getIssue("password") ? true : undefined}
            aria-describedby={getIssue("password") ? "password-hint" : undefined}
          />
          {getIssue("password") && (
            <p id="password-hint" className="field-hint" role="alert">
              {getIssue("password")}
            </p>
          )}

          <button
            className="button primary-button auth-submit"
            type="submit"
            disabled={submitting}
            aria-busy={submitting || undefined}
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <Link to="/signin" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
