import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { logger } from "./requestLogger.js";

type RequestWithId = Request & {
  id?: string | number;
};

export class AppError extends Error {
  public readonly statusCode: number;

  public readonly expose: boolean;

  constructor(message: string, statusCode = 500, expose = statusCode < 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.expose = expose;
  }
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const requestId = getRequestId(req);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: "Validation failed",
        requestId,
        issues: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.expose ? err.message : "Internal server error",
        requestId,
      },
    });
    return;
  }

  logger.error({ err, requestId }, "Unhandled request error");

  res.status(500).json({
    error: {
      message: "Internal server error",
      requestId,
    },
  });
}

function getRequestId(req: Request) {
  const requestId = (req as RequestWithId).id;
  const headerRequestId = req.headers["x-request-id"];

  if (requestId !== undefined) {
    return String(requestId);
  }

  if (typeof headerRequestId === "string") {
    return headerRequestId;
  }

  return "unknown";
}
