import type {
  AbTestRecord,
  AgentRecord,
  CampaignRecord,
  ContentRecord,
  CrmContactRecord,
  CustomerJourneyRecord,
  DashboardSnapshot,
  EmailCampaignRecord,
  EmergencyAlertRecord,
  SystemLogRecord,
  SystemMode,
  VideoShortRecord
} from "../shared/schema";

const now = new Date();

export const seedSystemMode: SystemMode = {
  isLive: false,
  deploymentTarget: "https://guvnorregent.xyz",
  dailyAiBudgetCents: 2500,
  updatedAt: now.toISOString()
};

export const seedAgents: AgentRecord[] = [
  {
    id: 1,
    name: "Oracle Signal Scout",
    crew: "Intelligence",
    model: "claude-sonnet-4-5",
    status: "running",
    objective: "Detect profitable AI image niches and competitor movement.",
    lastRunAt: now,
    successRate: 94
  },
  {
    id: 2,
    name: "Neon Copy Forge",
    crew: "Content",
    model: "gpt-5-mini",
    status: "running",
    objective: "Generate compliant ad hooks, landing-page copy, and email angles.",
    lastRunAt: now,
    successRate: 91
  },
  {
    id: 3,
    name: "ROAS Sentinel",
    crew: "Optimization",
    model: "gemini-2.5-flash",
    status: "watching",
    objective: "Monitor campaign economics and stop spend anomalies.",
    lastRunAt: now,
    successRate: 89
  },
  {
    id: 4,
    name: "Vault Warden",
    crew: "Security",
    model: "claude-sonnet-4-5",
    status: "idle",
    objective: "Audit secrets, key rotation status, and publishing readiness.",
    lastRunAt: now,
    successRate: 98
  },
  {
    id: 5,
    name: "Journey Conductor",
    crew: "Journey",
    model: "gpt-5-mini",
    status: "running",
    objective: "Advance CRM contacts through behavior-based automation.",
    lastRunAt: now,
    successRate: 87
  }
];

export const seedCampaigns: CampaignRecord[] = [
  { id: 1, clientId: 1, name: "Cyber Portrait Launch", platform: "Meta", status: "live", spendCents: 18400, revenueCents: 71120, roas: "3.87" },
  { id: 2, clientId: 2, name: "AI Wall Art Retargeting", platform: "TikTok", status: "learning", spendCents: 9200, revenueCents: 28400, roas: "3.09" },
  { id: 3, clientId: 1, name: "Prompt Pack Evergreen", platform: "Email", status: "queued", spendCents: 0, revenueCents: 12600, roas: "0" }
];

export const seedContent: ContentRecord[] = [
  { id: 1, title: "7 Cyberpunk Avatar Prompts That Sell", channel: "Blog", status: "review", complianceScore: 96, estimatedReach: 18000, isEstimatedReachSample: true },
  { id: 2, title: "Before/After AI Image Carousel", channel: "Instagram", status: "scheduled", complianceScore: 92, estimatedReach: 42000, isEstimatedReachSample: true },
  { id: 3, title: "Prompt Bundle Landing Page Hero", channel: "Website", status: "approved", complianceScore: 99, estimatedReach: 7400, isEstimatedReachSample: true }
];

export const seedVideos: VideoShortRecord[] = [
  { id: 1, title: "Make Your Profile Look Expensive", style: "neon", status: "rendered", platform: "TikTok", durationSeconds: 32, storagePath: ".private/videos/seed-profile.mp4" },
  { id: 2, title: "3 AI Wall Art Niches Exploding Now", style: "neon", status: "queued", platform: "Reels", durationSeconds: 41, storagePath: null },
  { id: 3, title: "Prompt Pack Offer Stack", style: "neon", status: "publishing", platform: "Shorts", durationSeconds: 28, storagePath: ".private/videos/seed-offer.mp4" }
];

export const seedEmail: EmailCampaignRecord[] = [
  { id: 1, name: "Neon Drop Welcome", provider: "resend", status: "sent", sent: 1280, opens: 603, clicks: 141, revenueCents: 18900 },
  { id: 2, name: "Abandoned Prompt Pack", provider: "resend", status: "active", sent: 391, opens: 204, clicks: 58, revenueCents: 8700 }
];

export const seedCrm: CrmContactRecord[] = [
  { id: 1, name: "Maya Chen", email: "maya@example.com", stage: "qualified", lifetimeValueCents: 9700 },
  { id: 2, name: "Leo Carter", email: "leo@example.com", stage: "checkout intent", lifetimeValueCents: 14900 },
  { id: 3, name: "Avery Stone", email: "avery@example.com", stage: "subscriber", lifetimeValueCents: 0 }
];

export const seedJourneys: CustomerJourneyRecord[] = [
  { id: 1, name: "New Subscriber Revenue Path", status: "active", enrollments: 932, completions: 312 },
  { id: 2, name: "High-Intent Retargeting", status: "active", enrollments: 188, completions: 73 }
];

export const seedAbTests: AbTestRecord[] = [
  { id: 1, name: "Landing Hero Promise", status: "running", variantA: "Luxury AI portraits", variantB: "Profile images that sell", winner: null, conversions: 93 },
  { id: 2, name: "Email CTA Button", status: "complete", variantA: "Get the pack", variantB: "Unlock the prompts", winner: "Unlock the prompts", conversions: 211 }
];

export const seedLogs: SystemLogRecord[] = [
  { id: 1, level: "info", message: "Swarm heartbeat nominal across 10 crews.", metadata: { crews: 10 }, createdAt: now },
  { id: 2, level: "warn", message: "Production send prerequisites pending for Resend webhook secret.", metadata: { secret: "RESEND_WEBHOOK_SECRET" }, createdAt: now },
  { id: 3, level: "info", message: "Live switch is in pre-launch forecast mode.", metadata: { isLive: false }, createdAt: now }
];

export const seedAlerts: EmergencyAlertRecord[] = [
  {
    id: 1,
    severity: "watch",
    title: "Publish prerequisites required",
    description: "Confirm DATABASE_URL, ADMIN_TOKEN, Resend sender domain, and DB schema publish before enabling live production mode.",
    isResolved: false,
    createdAt: now
  }
];

export const seedDashboard: DashboardSnapshot = {
  revenueCents: seedCampaigns.reduce((total, campaign) => total + campaign.revenueCents, 0),
  targetRevenueCents: 10_000_000,
  activeAgents: seedAgents.filter((agent) => agent.status === "running").length,
  totalAgents: 67,
  contentQueued: seedContent.filter((item) => item.status !== "approved").length,
  campaignsLive: seedCampaigns.filter((campaign) => campaign.status === "live" || campaign.status === "learning").length,
  aiSpendTodayCents: 1120,
  alertsOpen: seedAlerts.filter((alert) => !alert.isResolved).length,
  trend: [
    { label: "W-12", revenueCents: 12000 },
    { label: "W-10", revenueCents: 21400 },
    { label: "W-8", revenueCents: 35900 },
    { label: "W-6", revenueCents: 58200 },
    { label: "W-4", revenueCents: 88100 },
    { label: "W-2", revenueCents: 112800 },
    { label: "Now", revenueCents: 112120 }
  ]
};
