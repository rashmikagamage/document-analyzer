import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "./error.middleware.js";

type ValidationTarget = "body" | "query" | "params";

export function validate(schema: ZodTypeAny, target: ValidationTarget) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[target]);
      req[target] = parsed;
      next();
    } catch {
      next(
        new AppError("Validation failed.", {
          statusCode: 400,
          code: "VALIDATION_ERROR",
          expose: true,
        })
      );
    }
  };
}