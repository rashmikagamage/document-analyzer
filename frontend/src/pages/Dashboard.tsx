import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getSessionStatus } from "../api/auth";
import { getDriveFiles, type DriveFile } from "../api/drive";
import {
  analyzeDocument,
  type AnalyzeDocumentResponse,
} from "../api/analysis";
import { AnalysisModal } from "../components/AnalysisModal";
import { Button } from "../components/Button";
import { FileList } from "../components/FileList";
import { Spinner } from "../components/Spinner";

export function Dashboard() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [analysisResult, setAnalysisResult] =
    useState<AnalyzeDocumentResponse | null>(null);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setPageLoading(true);
        setPageError("");

        const session = await getSessionStatus();
        setAuthenticated(session.authenticated);

        if (!session.authenticated) {
          setFiles([]);
          return;
        }

        const result = await getDriveFiles();
        setFiles(result.files);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load dashboard.";
        setPageError(message);
      } finally {
        setPageLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  async function handleAnalyze(fileId: string) {
    if (analysisLoading) {
      return;
    }

    try {
      setActiveFileId(fileId);
      setModalOpen(true);
      setAnalysisLoading(true);
      setAnalysisError("");
      setAnalysisResult(null);

      const result = await analyzeDocument(fileId);
      setAnalysisResult(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to analyze document.";
      setAnalysisError(message);
    } finally {
      setAnalysisLoading(false);
      setActiveFileId(null);
    }
  }

  function handleCloseModal() {
    if (analysisLoading) {
      return;
    }

    setModalOpen(false);
    setAnalysisError("");
    setAnalysisResult(null);
    setActiveFileId(null);
  }

  const subtitle = useMemo(() => {
    if (pageLoading) {
      return "Loading recent PDF files...";
    }

    if (!authenticated) {
      return "You need to connect Google Drive to see and analyze documents.";
    }

    return "Browse recent PDFs and run AI analysis on demand.";
  }, [authenticated, pageLoading]);

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="topbar">
          <div className="brand">
            <div className="brand-mark">MS</div>
            <div className="brand-copy">
              <h2>Document Dashboard</h2>
              <p>{subtitle}</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/">
              <Button variant="ghost">Home</Button>
            </Link>
          </div>
        </div>

        <section className="surface-card">
          <div className="section-title-row">
            <div>
              <h2 className="section-title">Recent PDF files</h2>
              <p className="section-subtitle">
                Connected to Google Drive with secure server-side OAuth.
              </p>
            </div>
          </div>

          {authenticated && !pageLoading && !pageError ? (
            <div className="status-card status-card--info">
              Connected successfully. Select any PDF to generate structured AI
              analysis.
            </div>
          ) : null}

          {!authenticated && !pageLoading && !pageError ? (
            <div className="status-card status-card--error">
              You are not authenticated. Return to the home page and reconnect
              Google Drive.
            </div>
          ) : null}

          {pageLoading && <Spinner label="Loading dashboard..." />}

          {!pageLoading && pageError && (
            <div className="status-card status-card--error">
              <strong>Could not load the dashboard.</strong>
              <div style={{ marginTop: 6 }}>{pageError}</div>
            </div>
          )}
          <p className="section-subtitle">
            Analyses run on demand, large PDFs use staged summarization, and unchanged files can reuse cached results.
          </p>
          {!pageLoading && !pageError && authenticated && (
            <FileList
              files={files}
              onAnalyze={handleAnalyze}
              activeFileId={activeFileId}
            />
          )}
        </section>
      </div>

      <AnalysisModal
        open={modalOpen}
        loading={analysisLoading}
        error={analysisError}
        result={analysisResult}
        onClose={handleCloseModal}
      />
    </div>
  );
}