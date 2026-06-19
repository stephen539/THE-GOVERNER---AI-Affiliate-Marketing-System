import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import { config } from "./config";
import { registerRoutes } from "./routes";
import { createStorage } from "./storage";

const app = express();
const server = createServer(app);
const storage = createStorage();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

registerRoutes(app, storage);

const webSocketServer = new WebSocketServer({ server, path: "/ws" });

webSocketServer.on("connection", async (socket) => {
  socket.send(
    JSON.stringify({
      type: "connected",
      payload: {
        message: "Governer telemetry stream attached.",
        timestamp: new Date().toISOString()
      }
    })
  );

  socket.send(JSON.stringify({ type: "dashboard_snapshot", payload: await storage.getDashboardSnapshot() }));
});

setInterval(async () => {
  const payload = {
    type: "swarm_pulse",
    payload: {
      dashboard: await storage.getDashboardSnapshot(),
      timestamp: new Date().toISOString()
    }
  };

  const serialized = JSON.stringify(payload);
  webSocketServer.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(serialized);
    }
  });
}, 30_000);

if (config.nodeEnv === "production") {
  const publicDir = path.resolve(__dirname, "../public");
  app.use(express.static(publicDir));
  app.get("*", (_request, response) => {
    response.sendFile(path.join(publicDir, "index.html"));
  });
}

server.listen(config.port, "0.0.0.0", () => {
  console.log(`THE GOVERNER listening on port ${config.port}`);
  console.log(`Deployment target: ${config.deploymentTarget}`);
});
