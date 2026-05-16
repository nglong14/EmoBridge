import { createServer } from "node:http";

import { createApp } from "./app.js";
import { env } from "./config/index.js";
import { logger } from "./middleware/requestLogger.js";
import { attachWebsocket } from "./services/websocket.js";

const app = createApp();
const server = createServer(app);

attachWebsocket(server);

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "Gateway listening");
});
