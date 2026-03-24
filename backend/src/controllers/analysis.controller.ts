import type { NextFunction, Request, Response } from "express";
import { AppError } from "../middleware/error.middleware.js";
import {
  downloadPdfFile,
  getDriveFileMetadata,
} from "../services/drive/drive.service.js";
import { extractPdfText } from "../services/pdf/pdf-extract.service.js";
import {
  analyzeDocumentText,
  SMALL_DOCUMENT_THRESHOLD,
} from "../services/analysis/document-analysis.service.js";
import {
  getCachedAnalysis,
  setCachedAnalysis,
} from "../services/analysis/analysis-cache.service.js";

function isRateLimitError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("429") ||
    message.includes("rate limit") ||
    message.includes("quota") ||
    message.includes("resource exhausted")
  );
}

export async function analyzeDocument(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const accessToken = req.session?.accessToken;

    if (!accessToken) {
      throw new AppError("Unauthorized.", {
        statusCode: 401,
        code: "UNAUTHORIZED",
        expose: true,
      });
    }

    const { fileId } = req.body as { fileId: string };

    const metadata = await getDriveFileMetadata(accessToken, fileId);

    if (metadata.mimeType !== "application/pdf") {
      throw new AppError("Only PDF files are supported.", {
        statusCode: 400,
        code: "UNSUPPORTED_FILE_TYPE",
        expose: true,
      });
    }

    // Engineering judgment:
    // return cached analysis if the file version has not changed.
    const cached = getCachedAnalysis(fileId, metadata.modifiedTime);
    if (cached) {
      return res.status(200).json({
        file: metadata,
        analysis: cached.result,
        meta: {
          usedStagedMode: cached.usedStagedMode,
          cached: true,
        },
      });
    }

    const pdfBuffer = await downloadPdfFile(accessToken, fileId);
    const extractedText = await extractPdfText(pdfBuffer);

    const usedStagedMode = extractedText.length > SMALL_DOCUMENT_THRESHOLD;

    const analysis = await analyzeDocumentText(extractedText, metadata.name);

    setCachedAnalysis({
      fileId,
      modifiedTime: metadata.modifiedTime,
      result: analysis,
      usedStagedMode,
      createdAt: Date.now(),
    });

    res.status(200).json({
      file: metadata,
      analysis,
      meta: {
        usedStagedMode,
        cached: false,
      },
    });
  } catch (error) {
    if (isRateLimitError(error)) {
      return next(
        new AppError(
          "Analysis is temporarily rate-limited. Please wait a moment and try again.",
          {
            statusCode: 429,
            code: "RATE_LIMITED",
            expose: true,
          }
        )
      );
    }

    next(error);
  }
}