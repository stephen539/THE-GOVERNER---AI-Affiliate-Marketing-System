import type { Express, Request, Response } from "express";
import { z } from "zod";
import { requireAdminToken } from "./config";
import type { Storage } from "./storage";
import { setSystemModeSchema } from "../shared/schema";

function sendError(response: Response, status: number, message: string) {
  response.status(status).json({ error: message });
}

export function registerRoutes(app: Express, storage: Storage) {
  app.get("/api/health", async (_request, response) => {
    const mode = await storage.getSystemMode();
    response.json({
      ok: true,
      system: "THE GOVERNER",
      deploymentTarget: mode.deploymentTarget,
      isLive: mode.isLive,
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/system-mode", async (_request, response) => {
    response.json(await storage.getSystemMode());
  });

  app.post("/api/system-mode", async (request, response) => {
    const auth = requireAdminToken(request.headers["x-admin-token"]);
    if (!auth.ok) {
      sendError(response, auth.status, auth.message);
      return;
    }

    const parsed = setSystemModeSchema.safeParse(request.body);
    if (!parsed.success) {
      sendError(response, 400, parsed.error.issues.map((issue) => issue.message).join(", "));
      return;
    }

    response.json(await storage.setSystemMode(parsed.data.isLive));
  });

  app.get("/api/dashboard", async (_request, response) => {
    response.json(await storage.getDashboardSnapshot());
  });

  app.get("/api/agents", async (_request, response) => {
    response.json(await storage.getAgents());
  });

  app.post("/api/agents/:id/control", async (request: Request, response: Response) => {
    const auth = requireAdminToken(request.headers["x-admin-token"]);
    if (!auth.ok) {
      sendError(response, auth.status, auth.message);
      return;
    }

    const parsed = z.object({ status: z.enum(["idle", "running", "watching", "paused"]) }).safeParse(request.body);
    if (!parsed.success) {
      sendError(response, 400, "Agent status must be idle, running, watching, or paused.");
      return;
    }

    const agent = await storage.updateAgentStatus(Number(request.params.id), parsed.data.status);
    if (!agent) {
      sendError(response, 404, "Agent not found.");
      return;
    }

    response.json(agent);
  });

  app.get("/api/campaigns", async (_request, response) => {
    response.json(await storage.getCampaigns());
  });

  app.get("/api/content", async (_request, response) => {
    response.json(await storage.getContentItems());
  });

  app.get("/api/videos", async (_request, response) => {
    response.json(await storage.getVideoShorts());
  });

  app.get("/api/email", async (_request, response) => {
    response.json(await storage.getEmailCampaigns());
  });

  app.get("/api/crm", async (_request, response) => {
    response.json(await storage.getCrmContacts());
  });

  app.get("/api/journeys", async (_request, response) => {
    response.json(await storage.getCustomerJourneys());
  });

  app.get("/api/ab-tests", async (_request, response) => {
    response.json(await storage.getAbTests());
  });

  app.get("/api/activity", async (_request, response) => {
    response.json(await storage.getSystemLogs());
  });

  app.get("/api/alerts", async (_request, response) => {
    response.json(await storage.getEmergencyAlerts());
  });

  app.get("/api/security/key-vault/status", async (_request, response) => {
    response.json({
      encryption: "AES-256",
      configured: Boolean(process.env.API_KEY_VAULT_SECRET),
      productionReady: Boolean(process.env.API_KEY_VAULT_SECRET && process.env.ADMIN_TOKEN),
      note: "Set API_KEY_VAULT_SECRET and ADMIN_TOKEN before publishing live secret-management flows."
    });
  });
}
