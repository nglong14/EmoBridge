import { randomUUID } from "node:crypto";

import pino from "pino";
import { pinoHttp } from "pino-http";

import { env } from "../config/index.ts";

export const logger = pino({
  level: env.NODE_ENV === "test" ? "silent" : "info",
});

// Attach a request logger to the request object
export const requestLogger = pinoHttp({
  logger,
  genReqId(req, res) {
    const headerRequestId = req.headers["x-request-id"];
    const requestId =
      typeof headerRequestId === "string" ? headerRequestId : randomUUID();

    res.setHeader("x-request-id", requestId);

    return requestId;
  },
});
