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

function App() {
  return (
    <main className="landing-page">
      <nav className="top-nav" aria-label="Main navigation">
        <a className="brand" href="/" aria-label="EmoBridge home">
          <span className="brand-mark">
            <img src="/logo.png" alt="EmoBridge logo" />
          </span>
          <span>EmoBridge</span>
        </a>

        <div className="nav-actions">
          <a className="button ghost-button" href="/signin">
            Sign in
          </a>
          <a className="button primary-button" href="/signup">
            Sign up
          </a>
        </div>
      </nav>

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
            EmoBridge helps people communicate emotions with clarity, empathy,
            and practical next steps so hard conversations feel easier to begin.
          </p>

          <div className="hero-actions">
            <a className="button primary-button" href="/signup">
              Sign up
            </a>
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

export default App;
