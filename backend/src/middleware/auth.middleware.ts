import type { NextFunction, Request, Response } from "express";
import { AppError } from "./error.middleware.js";
import {
  readSession,
  sessionCookie,
} from "../services/auth/session.service.js";

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const signedSessionId = req.cookies?.[sessionCookie.name];
  const session = readSession(signedSessionId);

  console.log("AUTH COOKIE PRESENT:", Boolean(signedSessionId));
  console.log("AUTH COOKIE VALUE:", signedSessionId);
  console.log("SESSION FOUND:", Boolean(session));
  
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