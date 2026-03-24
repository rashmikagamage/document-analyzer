import { Router } from "express";
import { analyzeDocument } from "../controllers/analysis.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { analyzeDocumentBodySchema } from "../schemas/analysis.schema.js";

export const analysisRouter = Router();

analysisRouter.post(
  "/",
  requireAuth,
  validate(analyzeDocumentBodySchema, "body"),
  analyzeDocument
);