import { CanvasFactory } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import { AppError } from "../../middleware/error.middleware.js";

const MAX_TEXT_LENGTH = 20000;

/**
 * Extracts readable text from a text-based PDF.
 * For v1, we intentionally do not support OCR/image-only PDFs.
 */
export async function extractPdfText(pdfBuffer: Buffer): Promise<string> {
    const parser = new PDFParse({
        data: pdfBuffer,
        CanvasFactory,
    });

    try {
        const result = await parser.getText();

        const normalized = result.text
            .replace(/\r\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .replace(/[ \t]{2,}/g, " ")
            .trim();

        if (!normalized) {
            throw new AppError("No extractable text found in PDF.", {
                statusCode: 422,
                code: "PDF_TEXT_EXTRACTION_FAILED",
                expose: true,
            });
        }
        console.log("Extracted PDF text length:", normalized.length);
        return normalized.slice(0, MAX_TEXT_LENGTH);
    } finally {
        await parser.destroy();
    }
}