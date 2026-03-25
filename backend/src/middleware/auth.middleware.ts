import type { NextFunction, Request, Response } from "express";
import { AppError } from "./error.middleware.js";
import {
  readSession,
  sessionCookie,
} from "../services/auth/session.service.js";

// Resolve the signed session cookie into a server-side session and attach it
// to the request. Reject requests that do not have a valid authenticated session.
export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const signedSessionId = req.cookies?.[sessionCookie.name];
  const session = readSession(signedSessionId);
  
  if (!session) {
    return next(
      new AppError("Unauthorized.", {
        statusCode: 401,
        code: "UNAUTHORIZED",
        expose: true,
      })
    );
  }

  req.session = session;
  next();
}