import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";

export function createApp() {
  const app = express();

  app.use(requestLogger);
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true, // allow cookies to be sent from the frontend to the backend
    }),
  );
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/auth", authRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
