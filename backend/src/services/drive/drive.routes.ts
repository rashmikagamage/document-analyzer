import { Router } from "express";
import { listDriveFiles } from "./drive.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

export const driveRouter = Router();

driveRouter.get("/files", requireAuth, listDriveFiles);