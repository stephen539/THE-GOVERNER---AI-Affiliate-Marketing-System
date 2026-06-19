export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export type SystemMode = {
  isLive: boolean;
  deploymentTarget: string;
  dailyAiBudgetCents: number;
  updatedAt: string;
};

export type DashboardSnapshot = {
  revenueCents: number;
  targetRevenueCents: number;
  activeAgents: number;
  totalAgents: number;
  contentQueued: number;
  campaignsLive: number;
  aiSpendTodayCents: number;
  alertsOpen: number;
  trend: Array<{ label: string; revenueCents: number }>;
};

export type AgentRecord = {
  id: number;
  name: string;
  crew: string;
  model: string;
  status: string;
  objective: string;
  lastRunAt: string | null;
  successRate: number;
};

export type CampaignRecord = {
  id: number;
  name: string;
  platform: string;
  status: string;
  spendCents: number;
  revenueCents: number;
  roas: string;
};

export type ContentRecord = {
  id: number;
  title: string;
  channel: string;
  status: string;
  complianceScore: number;
  estimatedReach: number;
  isEstimatedReachSample: boolean;
};

export type VideoShortRecord = {
  id: number;
  title: string;
  style: string;
  status: string;
  platform: string;
  durationSeconds: number;
  storagePath: string | null;
};

export type EmailCampaignRecord = {
  id: number;
  name: string;
  provider: string;
  status: string;
  sent: number;
  opens: number;
  clicks: number;
  revenueCents: number;
};

export type CrmContactRecord = {
  id: number;
  name: string;
  email: string;
  stage: string;
  lifetimeValueCents: number;
};

export type CustomerJourneyRecord = {
  id: number;
  name: string;
  status: string;
  enrollments: number;
  completions: number;
};

export type AbTestRecord = {
  id: number;
  name: string;
  status: string;
  variantA: string;
  variantB: string;
  winner: string | null;
  conversions: number;
};

export type SystemLogRecord = {
  id: number;
  level: string;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type EmergencyAlertRecord = {
  id: number;
  severity: string;
  title: string;
  description: string;
  isResolved: boolean;
  createdAt: string;
};
