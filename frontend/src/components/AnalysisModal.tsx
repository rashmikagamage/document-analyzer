import { useEffect } from "react";
import type { AnalyzeDocumentResponse } from "../api/analysis";
import { Button } from "./Button";
import { Spinner } from "./Spinner";

type AnalysisModalProps = {
    open: boolean;
    loading: boolean;
    error: string;
    result: AnalyzeDocumentResponse | null;
    onClose: () => void;
};

export function AnalysisModal({
    open,
    loading,
    error,
    result,
    onClose,
}: AnalysisModalProps) {
    useEffect(() => {
        if (!open) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    const fileName = result?.file.name ?? "Document analysis";

    return (
        <div
            className="modal-overlay"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="modal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="analysis-modal-title"
            >
                <div className="modal-header">
                    <div className="modal-title-wrap">
                        <h2 id="analysis-modal-title">PDF Analysis</h2>
                        <p>{fileName}</p>

                        {result?.meta?.usedStagedMode ? (
                            <span
                                style={{
                                    display: "inline-block",
                                    marginTop: "6px",
                                    marginRight: "8px",
                                    padding: "4px 10px",
                                    borderRadius: "999px",
                                    background: "rgba(124, 156, 255, 0.12)",
                                    border: "1px solid rgba(124, 156, 255, 0.22)",
                                    fontSize: "12px",
                                    color: "#cdd8ea",
                                }}
                            >
                                Large document • staged analysis
                            </span>
                        ) : null}

                        {result?.meta?.cached ? (
                            <span
                                style={{
                                    display: "inline-block",
                                    marginTop: "6px",
                                    padding: "4px 10px",
                                    borderRadius: "999px",
                                    background: "rgba(34, 197, 94, 0.12)",
                                    border: "1px solid rgba(34, 197, 94, 0.22)",
                                    fontSize: "12px",
                                    color: "#d7ffe5",
                                }}
                            >
                                Cached result
                            </span>
                        ) : null}
                    </div>
                    <Button variant="ghost" onClick={onClose}>
                        Close
                    </Button>
                </div>

                <div className="modal-body">
                    {loading && <Spinner label="Analyzing document..." />}

                    {!loading && error && (
                        <div className="status-card status-card--error">
                            <strong>Analysis failed.</strong>
                            <div style={{ marginTop: 6 }}>{error}</div>
                        </div>
                    )}

                    {!loading && !error && result && (
                        <>
                            <section className="analysis-section">
                                <h3>One-sentence summary</h3>
                                <div className="analysis-panel">
                                    <p>{result.analysis.shortSummary}</p>
                                </div>
                            </section>

                            <section className="analysis-section">
                                <h3>Detailed summary</h3>
                                <div className="analysis-panel">
                                    <p>{result.analysis.longSummary}</p>
                                </div>
                            </section>

                            <section className="analysis-section">
                                <h3>Top 10 keywords</h3>
                                <div className="analysis-panel">
                                    <div className="keyword-list">
                                        {result.analysis.keywords.map((keyword) => (
                                            <span key={keyword} className="keyword-chip">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <p className="footer-note">
                                Review the original file in Google Drive if you need the source
                                text.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}