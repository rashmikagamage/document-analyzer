import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getSessionStatus } from "../api/auth";
import { getDriveFiles } from "../api/drive";
import {
  analyzeDocument,
  type AnalyzeDocumentResponse,
} from "../api/analysis";
import { AnalysisModal } from "../components/AnalysisModal";
import { Button } from "../components/Button";
import { FileList } from "../components/FileList";
import { Spinner } from "../components/Spinner";
import { useDashboardCache } from "../context/DashboardContexct";

export function Dashboard() {
  const {
    authenticated,
    files,
    hasLoaded,
    setAuthenticated,
    setFiles,
    setHasLoaded,
  } = useDashboardCache();

  const [pageLoading, setPageLoading] = useState(!hasLoaded);
  const [pageError, setPageError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [analysisResult, setAnalysisResult] =
    useState<AnalyzeDocumentResponse | null>(null);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  useEffect(() => {
    if (hasLoaded) {
      return;
    }
    async function loadDashboard() {
      try {
        setPageLoading(true);
        setPageError("");

        const session = await getSessionStatus();
        setAuthenticated(session.authenticated);

        if (!session.authenticated) {
          setFiles([]);
          setHasLoaded(true);
          return;
        }

        const result = await getDriveFiles();
        setFiles(result.files);
        setHasLoaded(true);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load dashboard.";
        setPageError(message);
      } finally {
        setPageLoading(false);
      }
    }

    void loadDashboard();
  }, [hasLoaded, setAuthenticated, setFiles, setHasLoaded]);

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
            <div className="brand-mark">SD</div>
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