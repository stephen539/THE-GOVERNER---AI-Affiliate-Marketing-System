import {
  boolean,
  decimal,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  isLive: boolean("is_live").notNull().default(false),
  deploymentTarget: varchar("deployment_target", { length: 255 }).notNull().default("https://guvnorregent.xyz"),
  dailyAiBudgetCents: integer("daily_ai_budget_cents").notNull().default(2500),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  crew: varchar("crew", { length: 80 }).notNull(),
  model: varchar("model", { length: 80 }).notNull(),
  status: varchar("status", { length: 40 }).notNull().default("idle"),
  objective: text("objective").notNull(),
  lastRunAt: timestamp("last_run_at"),
  successRate: integer("success_rate").notNull().default(0)
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  niche: varchar("niche", { length: 120 }).notNull(),
  healthScore: integer("health_score").notNull().default(0),
  monthlyRevenueCents: integer("monthly_revenue_cents").notNull().default(0)
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  name: varchar("name", { length: 160 }).notNull(),
  platform: varchar("platform", { length: 80 }).notNull(),
  status: varchar("status", { length: 40 }).notNull().default("draft"),
  spendCents: integer("spend_cents").notNull().default(0),
  revenueCents: integer("revenue_cents").notNull().default(0),
  roas: decimal("roas", { precision: 8, scale: 2 }).notNull().default("0")
});

export const contentItems = pgTable("content_items", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  channel: varchar("channel", { length: 80 }).notNull(),
  status: varchar("status", { length: 40 }).notNull().default("queued"),
  complianceScore: integer("compliance_score").notNull().default(0),
  estimatedReach: integer("estimated_reach").notNull().default(0),
  isEstimatedReachSample: boolean("is_estimated_reach_sample").notNull().default(true)
});

export const videoShorts = pgTable("video_shorts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  style: varchar("style", { length: 80 }).notNull().default("neon"),
  status: varchar("status", { length: 40 }).notNull().default("queued"),
  platform: varchar("platform", { length: 80 }).notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  storagePath: text("storage_path")
});

export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  provider: varchar("provider", { length: 80 }).notNull().default("resend"),
  status: varchar("status", { length: 40 }).notNull().default("draft"),
  sent: integer("sent").notNull().default(0),
  opens: integer("opens").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  revenueCents: integer("revenue_cents").notNull().default(0)
});

export const crmContacts = pgTable("crm_contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  stage: varchar("stage", { length: 80 }).notNull().default("lead"),
  lifetimeValueCents: integer("lifetime_value_cents").notNull().default(0)
});

export const customerJourneys = pgTable("customer_journeys", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  status: varchar("status", { length: 40 }).notNull().default("paused"),
  enrollments: integer("enrollments").notNull().default(0),
  completions: integer("completions").notNull().default(0)
});

export const abTests = pgTable("ab_tests", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  status: varchar("status", { length: 40 }).notNull().default("draft"),
  variantA: varchar("variant_a", { length: 120 }).notNull(),
  variantB: varchar("variant_b", { length: 120 }).notNull(),
  winner: varchar("winner", { length: 120 }),
  conversions: integer("conversions").notNull().default(0)
});

export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  level: varchar("level", { length: 30 }).notNull().default("info"),
  message: text("message").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const emergencyAlerts = pgTable("emergency_alerts", {
  id: serial("id").primaryKey(),
  severity: varchar("severity", { length: 30 }).notNull().default("watch"),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description").notNull(),
  isResolved: boolean("is_resolved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const systemModeSchema = z.object({
  isLive: z.boolean(),
  deploymentTarget: z.string().url(),
  dailyAiBudgetCents: z.number().int().nonnegative(),
  updatedAt: z.string()
});

export const dashboardSnapshotSchema = z.object({
  revenueCents: z.number().int().nonnegative(),
  targetRevenueCents: z.number().int().positive(),
  activeAgents: z.number().int().nonnegative(),
  totalAgents: z.number().int().positive(),
  contentQueued: z.number().int().nonnegative(),
  campaignsLive: z.number().int().nonnegative(),
  aiSpendTodayCents: z.number().int().nonnegative(),
  alertsOpen: z.number().int().nonnegative(),
  trend: z.array(z.object({ label: z.string(), revenueCents: z.number().int().nonnegative() }))
});

export const setSystemModeSchema = z.object({
  isLive: z.boolean()
});

export type SystemMode = z.infer<typeof systemModeSchema>;
export type DashboardSnapshot = z.infer<typeof dashboardSnapshotSchema>;
export type AgentRecord = typeof agents.$inferSelect;
export type CampaignRecord = typeof campaigns.$inferSelect;
export type ContentRecord = typeof contentItems.$inferSelect;
export type VideoShortRecord = typeof videoShorts.$inferSelect;
export type EmailCampaignRecord = typeof emailCampaigns.$inferSelect;
export type CrmContactRecord = typeof crmContacts.$inferSelect;
export type CustomerJourneyRecord = typeof customerJourneys.$inferSelect;
export type AbTestRecord = typeof abTests.$inferSelect;
export type SystemLogRecord = typeof systemLogs.$inferSelect;
export type EmergencyAlertRecord = typeof emergencyAlerts.$inferSelect;
