import "dotenv/config";

import { z } from "zod";

const developmentDefaults = {
  JWT_SECRET: "change-me-in-development-only-32-chars",
  OAUTH_COOKIE_SECRET: "change-me-in-development-only-32-char",
};

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET must be at least 32 characters")
      .default(developmentDefaults.JWT_SECRET),
    DATABASE_URL: z
      .string()
      .url()
      .default("postgresql://postgres:postgres@localhost:5432/emobridge"),
    AI_SERVICE_URL: z.string().url().default("http://localhost:8000"),
    CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
    FRONTEND_URL: z.string().url().default("http://localhost:5173"),
    OAUTH_COOKIE_SECRET: z
      .string()
      .min(32, "OAUTH_COOKIE_SECRET must be at least 32 characters")
      .default(developmentDefaults.OAUTH_COOKIE_SECRET),
    GOOGLE_CLIENT_ID: z.string().min(1).default("replace-with-google-client-id"),
    GOOGLE_CLIENT_SECRET: z
      .string()
      .min(1)
      .default("replace-with-google-client-secret"),
    GOOGLE_REDIRECT_URI: z
      .string()
      .url()
      .default("http://localhost:3000/auth/google/callback"),
    JWT_EXPIRES_IN: z.string().default("15m"),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== "production") {
      return;
    }

    for (const [key, value] of Object.entries(developmentDefaults)) {
      if (env[key as keyof typeof developmentDefaults] === value) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `${key} must be set to a production secret`,
        });
      }
    }
  });

export const env = envSchema.parse(process.env);

export type Env = typeof env;
