import { apiFetch } from "./client";
import type { DriveFile } from "./drive";

export type DocumentAnalysis = {
  shortSummary: string;
  longSummary: string;
  keywords: string[];
};

export type AnalyzeDocumentResponse = {
  file: DriveFile;
  analysis: DocumentAnalysis;
  meta?: {
    usedStagedMode?: boolean;
    cached?: boolean;
  };
};

export function analyzeDocument(fileId: string) {
  return apiFetch<AnalyzeDocumentResponse>("/api/analysis", {
    method: "POST",
    body: JSON.stringify({ fileId }),
  });
}