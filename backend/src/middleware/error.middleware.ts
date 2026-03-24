import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.js";

export class AppError extends Error {
  statusCode: number;
  code: string;
  expose: boolean;

  constructor(
    message: string,
    options?: { statusCode?: number; code?: string; expose?: boolean }
  ) {
    super(message);
    this.statusCode = options?.statusCode ?? 500;
    this.code = options?.code ?? "INTERNAL_SERVER_ERROR";
    this.expose = options?.expose ?? false;
  }
}

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }

  const appError =
    err instanceof AppError
      ? err
      : new AppError("Something went wrong.", {
          statusCode: 500,
          code: "INTERNAL_SERVER_ERROR",
          expose: false,
        });

  logger.error(
    {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: appError.statusCode,
      code: appError.code,
      err,
    },
    "request_failed"
  );

  res.status(appError.statusCode).json({
    error: {
      code: appError.code,
      message: appError.expose ? appError.message : "Something went wrong.",
      requestId: req.requestId,
    },
  });
}