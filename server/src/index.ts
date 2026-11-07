import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { JellyfinClient } from "./jellyfin.js";

const config = loadConfig();
const app = createApp({ config, jellyfin: new JellyfinClient(config) });

app.server.listen(config.port, "0.0.0.0", () => {
  console.log(`[server] Listening on port ${config.port}`);
});

const shutdown = (): void => {
  void app.close().then(() => process.exit(0));
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
