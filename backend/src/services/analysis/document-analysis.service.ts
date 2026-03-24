import { z } from "zod";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { env } from "../../config/env.js";

export const SMALL_DOCUMENT_THRESHOLD = 120_000;

const CHUNK_SIZE = 4_000;
const CHUNK_OVERLAP = 400;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_CHUNKS = 8;

const finalAnalysisSchema = z.object({
  shortSummary: z
    .string()
    .describe("A single-sentence summary of what the PDF is about."),
  longSummary: z
    .string()
    .describe("A slightly longer summary in one concise paragraph."),
  keywords: z
    .array(z.string())
    .length(10)
    .describe("Exactly 10 high-signal keywords or short key phrases."),
});

const chunkSummarySchema = z.object({
  summary: z.string().describe("A concise summary of this chunk."),
  keyPoints: z
    .array(z.string())
    .max(5)
    .describe("Up to 5 important points from this chunk."),
  keywords: z
    .array(z.string())
    .max(8)
    .describe("Up to 8 useful keywords from this chunk."),
});

export type DocumentAnalysisResult = z.infer<typeof finalAnalysisSchema>;

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.2,
  apiKey: env.GOOGLE_API_KEY,
  maxRetries: 3,
});

function getInvokeOptions() {
  return {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  };
}

/**
 * One-shot analysis for smaller PDFs.
 */
async function analyzeSmallDocument(
  documentText: string,
  fileName?: string
): Promise<DocumentAnalysisResult> {
  const structuredModel = model.withStructuredOutput(finalAnalysisSchema);

  const prompt = `
You are analyzing a PDF document for a user dashboard.

Return:
1. shortSummary: exactly one sentence
2. longSummary: one concise paragraph
3. keywords: exactly 10 keywords or short key phrases

Rules:
- Be factual and concise
- Do not invent unsupported details
- Avoid duplicates in keywords
- Prefer content/topic keywords, not generic words

File name: ${fileName ?? "Unknown"}

Document text:
"""
${documentText}
"""
`;

  return structuredModel.invoke(prompt, getInvokeOptions());
}

/**
 * Chunk-level summary for large PDFs.
 */
async function summarizeChunk(
  text: string,
  chunkIndex: number
): Promise<z.infer<typeof chunkSummarySchema>> {
  const structuredModel = model.withStructuredOutput(chunkSummarySchema);

  const prompt = `
You are analyzing one chunk from a larger PDF.

Return:
- summary: concise summary of this chunk
- keyPoints: up to 5 important points
- keywords: up to 8 useful keywords

Rules:
- Stay faithful to the text
- Do not infer beyond the chunk
- Keep output concise

Chunk number: ${chunkIndex + 1}

Chunk text:
"""
${text}
"""
`;

  return structuredModel.invoke(prompt, getInvokeOptions());
}

/**
 * Merge chunk summaries into the final dashboard result.
 */
async function mergeChunkSummaries(
  chunkSummaries: Array<z.infer<typeof chunkSummarySchema>>,
  fileName?: string
): Promise<DocumentAnalysisResult> {
  const structuredModel = model.withStructuredOutput(finalAnalysisSchema);

  const combinedContext = chunkSummaries
    .map((chunk, index) =>
      [
        `Chunk ${index + 1}:`,
        `Summary: ${chunk.summary}`,
        `Key points: ${chunk.keyPoints.join("; ")}`,
        `Keywords: ${chunk.keywords.join(", ")}`,
      ].join("\n")
    )
    .join("\n\n");

  const prompt = `
You are producing the final document analysis for a large PDF.

You have already been given chunk-level summaries from across the document.

Return:
1. shortSummary: exactly one sentence
2. longSummary: one concise paragraph
3. keywords: exactly 10 keywords or short key phrases

Rules:
- Synthesize across the full document
- Remove duplicates
- Be factual and concise
- Do not mention "chunks"

File name: ${fileName ?? "Unknown"}

Chunk summaries:
"""
${combinedContext}
"""
`;

  return structuredModel.invoke(prompt, getInvokeOptions());
}

/**
 * Main entry point:
 * - small docs: one-shot
 * - large docs: staged summarization
 */
export async function analyzeDocumentText(
  documentText: string,
  fileName?: string
): Promise<DocumentAnalysisResult> {
  if (!documentText.trim()) {
    throw new Error("Document text is empty.");
  }

  if (documentText.length <= SMALL_DOCUMENT_THRESHOLD) {
    return analyzeSmallDocument(documentText, fileName);
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const chunks = await splitter.splitText(documentText);

  // Important free-tier guardrail:
  // do not let one huge PDF consume too many model calls.
  const limitedChunks = chunks.slice(0, MAX_CHUNKS);

  const chunkSummaries = await Promise.all(
    limitedChunks.map((chunk, index) => summarizeChunk(chunk, index))
  );

  return mergeChunkSummaries(chunkSummaries, fileName);
}