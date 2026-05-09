import { createServer } from "node:http";

import { createApp } from "./app.js";
import { env } from "./config/index.js";
import { logger } from "./middleware/requestLogger.js";

const app = createApp();
const server = createServer(app);

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "Gateway listening");
});
