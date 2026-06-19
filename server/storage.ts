import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  abTests,
  agents,
  campaigns,
  contentItems,
  crmContacts,
  customerJourneys,
  emailCampaigns,
  emergencyAlerts,
  systemLogs,
  systemSettings,
  videoShorts,
  type AbTestRecord,
  type AgentRecord,
  type CampaignRecord,
  type ContentRecord,
  type CrmContactRecord,
  type CustomerJourneyRecord,
  type DashboardSnapshot,
  type EmailCampaignRecord,
  type EmergencyAlertRecord,
  type SystemLogRecord,
  type SystemMode,
  type VideoShortRecord
} from "../shared/schema";
import { config } from "./config";
import {
  seedAbTests,
  seedAgents,
  seedAlerts,
  seedCampaigns,
  seedContent,
  seedCrm,
  seedDashboard,
  seedEmail,
  seedJourneys,
  seedLogs,
  seedSystemMode,
  seedVideos
} from "./seed";

export interface Storage {
  getSystemMode(): Promise<SystemMode>;
  setSystemMode(isLive: boolean): Promise<SystemMode>;
  getDashboardSnapshot(): Promise<DashboardSnapshot>;
  getAgents(): Promise<AgentRecord[]>;
  updateAgentStatus(id: number, status: string): Promise<AgentRecord | undefined>;
  getCampaigns(): Promise<CampaignRecord[]>;
  getContentItems(): Promise<ContentRecord[]>;
  getVideoShorts(): Promise<VideoShortRecord[]>;
  getEmailCampaigns(): Promise<EmailCampaignRecord[]>;
  getCrmContacts(): Promise<CrmContactRecord[]>;
  getCustomerJourneys(): Promise<CustomerJourneyRecord[]>;
  getAbTests(): Promise<AbTestRecord[]>;
  getSystemLogs(): Promise<SystemLogRecord[]>;
  getEmergencyAlerts(): Promise<EmergencyAlertRecord[]>;
}

class MemoryStorage implements Storage {
  private systemMode = { ...seedSystemMode };
  private agentRows = seedAgents.map((agent) => ({ ...agent }));

  async getSystemMode() {
    return this.systemMode;
  }

  async setSystemMode(isLive: boolean) {
    this.systemMode = {
      ...this.systemMode,
      isLive,
      updatedAt: new Date().toISOString()
    };
    return this.systemMode;
  }

  async getDashboardSnapshot() {
    return {
      ...seedDashboard,
      aiSpendTodayCents: this.systemMode.isLive ? seedDashboard.aiSpendTodayCents : this.systemMode.dailyAiBudgetCents
    };
  }

  async getAgents() {
    return this.agentRows;
  }

  async updateAgentStatus(id: number, status: string) {
    const agent = this.agentRows.find((row) => row.id === id);
    if (!agent) return undefined;
    agent.status = status;
    agent.lastRunAt = new Date();
    return agent;
  }

  async getCampaigns() {
    return seedCampaigns;
  }

  async getContentItems() {
    return seedContent;
  }

  async getVideoShorts() {
    return seedVideos;
  }

  async getEmailCampaigns() {
    return seedEmail;
  }

  async getCrmContacts() {
    return seedCrm;
  }

  async getCustomerJourneys() {
    return seedJourneys;
  }

  async getAbTests() {
    return seedAbTests;
  }

  async getSystemLogs() {
    return seedLogs;
  }

  async getEmergencyAlerts() {
    return seedAlerts;
  }
}

class PostgresStorage implements Storage {
  private readonly db;

  constructor(databaseUrl: string) {
    const pool = new pg.Pool({ connectionString: databaseUrl });
    this.db = drizzle(pool);
  }

  async getSystemMode() {
    const [row] = await this.db.select().from(systemSettings).where(eq(systemSettings.id, 1)).limit(1);
    if (!row) return seedSystemMode;
    return {
      isLive: row.isLive,
      deploymentTarget: row.deploymentTarget,
      dailyAiBudgetCents: row.dailyAiBudgetCents,
      updatedAt: row.updatedAt.toISOString()
    };
  }

  async setSystemMode(isLive: boolean) {
    const updatedAt = new Date();
    const [updated] = await this.db
      .insert(systemSettings)
      .values({
        id: 1,
        isLive,
        deploymentTarget: config.deploymentTarget,
        updatedAt
      })
      .onConflictDoUpdate({
        target: systemSettings.id,
        set: { isLive, updatedAt, deploymentTarget: config.deploymentTarget }
      })
      .returning();

    return {
      isLive: updated.isLive,
      deploymentTarget: updated.deploymentTarget,
      dailyAiBudgetCents: updated.dailyAiBudgetCents,
      updatedAt: updated.updatedAt.toISOString()
    };
  }

  async getDashboardSnapshot() {
    const [agentRows, campaignRows, contentRows, alertRows, mode] = await Promise.all([
      this.getAgents(),
      this.getCampaigns(),
      this.getContentItems(),
      this.getEmergencyAlerts(),
      this.getSystemMode()
    ]);

    const revenueCents = campaignRows.reduce((total, campaign) => total + campaign.revenueCents, 0);
    return {
      revenueCents,
      targetRevenueCents: seedDashboard.targetRevenueCents,
      activeAgents: agentRows.filter((agent) => agent.status === "running").length,
      totalAgents: 67,
      contentQueued: contentRows.filter((item) => item.status !== "approved").length,
      campaignsLive: campaignRows.filter((campaign) => ["live", "learning"].includes(campaign.status)).length,
      aiSpendTodayCents: mode.isLive ? seedDashboard.aiSpendTodayCents : mode.dailyAiBudgetCents,
      alertsOpen: alertRows.filter((alert) => !alert.isResolved).length,
      trend: seedDashboard.trend
    };
  }

  async getAgents() {
    return this.db.select().from(agents);
  }

  async updateAgentStatus(id: number, status: string) {
    const [updated] = await this.db
      .update(agents)
      .set({ status, lastRunAt: new Date() })
      .where(eq(agents.id, id))
      .returning();
    return updated;
  }

  async getCampaigns() {
    return this.db.select().from(campaigns);
  }

  async getContentItems() {
    return this.db.select().from(contentItems);
  }

  async getVideoShorts() {
    return this.db.select().from(videoShorts);
  }

  async getEmailCampaigns() {
    return this.db.select().from(emailCampaigns);
  }

  async getCrmContacts() {
    return this.db.select().from(crmContacts);
  }

  async getCustomerJourneys() {
    return this.db.select().from(customerJourneys);
  }

  async getAbTests() {
    return this.db.select().from(abTests);
  }

  async getSystemLogs() {
    return this.db.select().from(systemLogs);
  }

  async getEmergencyAlerts() {
    return this.db.select().from(emergencyAlerts);
  }
}

export function createStorage(): Storage {
  if (!config.databaseUrl) {
    return new MemoryStorage();
  }

  return new PostgresStorage(config.databaseUrl);
}
