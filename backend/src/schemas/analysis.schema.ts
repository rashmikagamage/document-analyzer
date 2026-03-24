import { z } from "zod";

export const analyzeDocumentBodySchema = z.object({
  fileId: z.string().min(1),
});