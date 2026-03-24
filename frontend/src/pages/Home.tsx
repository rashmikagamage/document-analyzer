import { Link } from "react-router-dom";
import { getGoogleAuthUrl } from "../api/auth";
import { Button } from "../components/Button";

export function Home() {
  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="topbar">
          <div className="brand">
            <div className="brand-mark">MS</div>
            <div className="brand-copy">
              <h1>Settify - DocAnalyzer</h1>
              <p>Connected services dashboard with document intelligence</p>
            </div>
          </div>

          <Link className="link-inline" to="/dashboard">
            View dashboard
          </Link>
        </div>

        <section className="hero-card">
          <div className="hero-grid">
            <div>
              <span className="hero-eyebrow">Google Drive + LangChain + Gemini</span>
              <h2 className="hero-title">
                Understand your PDFs at a glance.
              </h2>
              <p className="hero-subtitle">
                Connect Google Drive, browse your recent PDF files, and generate
                fast, structured AI summaries with one sentence, a longer
                explanation, and top keywords.
              </p>

              <div className="hero-actions">
                <a href={getGoogleAuthUrl()}>
                  <Button variant="primary">Connect Google Drive</Button>
                </a>

                <Link to="/dashboard">
                  <Button variant="secondary">Open dashboard</Button>
                </Link>
              </div>
            </div>

            <aside className="hero-side">
              <div className="mini-panel">
                <h3>What you get</h3>
                <p>
                  OAuth-based Google Drive access, recent PDF discovery, and
                  on-demand analysis in a clean dashboard flow.
                </p>
              </div>

              <div className="mini-panel">
                <h3>Analysis output</h3>
                <p>
                  One-sentence summary, a longer summary paragraph, and 10
                  high-signal keywords presented in a popup modal.
                </p>
              </div>

              <div className="mini-panel">
                <h3>Limitations</h3>
                <p>
                  This version focuses on text based PDFs and does not extract information from images or scanned documents. To see other limitation please check the GitHub repo readme.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}