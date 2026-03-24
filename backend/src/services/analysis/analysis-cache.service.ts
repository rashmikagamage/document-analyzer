import type { DocumentAnalysisResult } from "./document-analysis.service.js";

export type CachedAnalysisEntry = {
  fileId: string;
  modifiedTime?: string;
  result: DocumentAnalysisResult;
  usedStagedMode: boolean;
  createdAt: number;
};

const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

const analysisCache = new Map<string, CachedAnalysisEntry>();

function getCacheKey(fileId: string) {
  return fileId;
}

/**
 * Returns a cached result only if:
 * - the file matches
 * - modifiedTime still matches
 * - the entry has not expired
 */
export function getCachedAnalysis(
  fileId: string,
  modifiedTime?: string
): CachedAnalysisEntry | null {
  const cacheKey = getCacheKey(fileId);
  const entry = analysisCache.get(cacheKey);

  if (!entry) {
    return null;
  }

  const isExpired = Date.now() - entry.createdAt > CACHE_TTL_MS;
  if (isExpired) {
    analysisCache.delete(cacheKey);
    return null;
  }

  if (entry.modifiedTime !== modifiedTime) {
    analysisCache.delete(cacheKey);
    return null;
  }

  return entry;
}

export function setCachedAnalysis(entry: CachedAnalysisEntry) {
  const cacheKey = getCacheKey(entry.fileId);
  analysisCache.set(cacheKey, entry);
}