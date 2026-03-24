import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  googleAuthCallback,
  startGoogleAuth,
  getSessionStatus
} from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.get("/google", startGoogleAuth);
authRouter.get("/google/callback", googleAuthCallback);
authRouter.get("/session", requireAuth, getSessionStatus);