import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/index.js";
import type { AuthUser } from "../types/index.js";
import { AppError } from "./error.js";

type JwtPayload = {
  sub: string;
  email: string;
};

function isJwtPayload(value: unknown): value is JwtPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "sub" in value &&
    typeof (value as Record<string, unknown>)["sub"] === "string" &&
    "email" in value &&
    typeof (value as Record<string, unknown>)["email"] === "string"
  );
}

export function signToken(user: AuthUser): string {
  // Cast to SignOptions to satisfy exactOptionalPropertyTypes — expiresIn is
  // always present at runtime (config has a default of "15m").
  const options = { algorithm: "HS256", expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions;
  return jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, options);
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Missing or malformed Authorization header", 401));
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });

    if (!isJwtPayload(payload)) {
      return next(new AppError("Invalid token payload", 401));
    }

    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }
}
