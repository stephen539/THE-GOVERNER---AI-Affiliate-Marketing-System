import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BarChart3,
  Bot,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  Clapperboard,
  ClipboardCheck,
  DatabaseZap,
  Factory,
  FlaskConical,
  Handshake,
  KeyRound,
  Mail,
  Megaphone,
  MessageSquare,
  Music,
  Newspaper,
  Orbit,
  PlugZap,
  Power,
  Radar,
  Rocket,
  Route as RouteIcon,
  Search,
  ShieldCheck,
  Siren,
  Sparkles,
  ToggleRight,
  UserCheck,
  WalletCards,
  WandSparkles,
  Wrench,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Link, Route, Switch, useLocation } from "wouter";
import {
  apiGet,
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
} from "./api";
import { DemoBanner, SampleTag } from "./components/DemoBadge";
import { compact, currency, percent } from "./format";

const navSections = [
  {
    label: "Operations",
    items: [
      { href: "/", label: "Command Center", icon: Radar },
      { href: "/governor-chat", label: "Governor Chat", icon: MessageSquare },
      { href: "/morning-briefing", label: "Morning Briefing", icon: Newspaper },
      { href: "/agents", label: "Agent Swarm", icon: Bot },
      { href: "/content", label: "Content Pipeline", icon: Clapperboard },
      { href: "/video-production", label: "Video Production", icon: Clapperboard },
      { href: "/marketing-studio", label: "Marketing Studio", icon: Megaphone },
      { href: "/campaigns", label: "Campaigns", icon: BarChart3 },
      { href: "/skill-creator", label: "Skill Creator", icon: WandSparkles },
      { href: "/guvnor-relay", label: "Guvnor Relay", icon: PlugZap },
      { href: "/client-oversight", label: "Client Oversight", icon: UserCheck },
      { href: "/clients", label: "Clients", icon: BriefcaseBusiness },
      { href: "/symphony-launcher", label: "Symphony Launcher", icon: Music },
      { href: "/live-research", label: "Live Research", icon: Search },
      { href: "/operations-guide", label: "Operations Guide", icon: BookOpen }
    ]
  },
  {
    label: "GhostStream",
    items: [
      { href: "/ghoststream", label: "GhostStream", icon: Orbit },
      { href: "/gs-factory", label: "GS Factory", icon: Factory }
    ]
  },
  {
    label: "Marketing",
    items: [
      { href: "/email-marketing", label: "Email Marketing", icon: Mail },
      { href: "/crm", label: "CRM + Leads", icon: Users },
      { href: "/journeys", label: "Journeys", icon: RouteIcon },
      { href: "/ab-testing", label: "A/B Testing", icon: FlaskConical }
    ]
  },
  {
    label: "System",
    items: [
      { href: "/agent-engine", label: "Agent Engine", icon: Bot },
      { href: "/security", label: "Security", icon: KeyRound },
      { href: "/tools-services", label: "Tools & Services", icon: Wrench },
      { href: "/budget-tracker", label: "Budget Tracker", icon: WalletCards },
      { href: "/compliance", label: "Compliance", icon: ClipboardCheck },
      { href: "/activity", label: "Activity Log", icon: Activity },
      { href: "/system-online", label: "System Online", icon: Power },
      { href: "/admin", label: "Deployment Console", icon: ToggleRight, hidden: true }
    ]
  }
];

const moduleDetails = {
  "/governor-chat": {
    icon: MessageSquare,
    title: "Governor Chat",
    caption: "Operator chat lane for campaign commands, approvals, and swarm prompts.",
    status: "ready",
    bullets: ["Command intake", "Approval handoff", "Swarm prompt routing"]
  },
  "/skill-creator": {
    icon: WandSparkles,
    title: "Skill Creator",
    caption: "Create reusable playbooks for content, research, compliance, and client workflows.",
    status: "draft",
    bullets: ["Skill templates", "Runbook versioning", "Agent assignment"]
  },
  "/guvnor-relay": {
    icon: PlugZap,
    title: "Guvnor Relay",
    caption: "Relay operational updates between the command layer and external services.",
    status: "standby",
    bullets: ["Webhook dispatch", "Signal fanout", "Escalation routing"]
  },
  "/symphony-launcher": {
    icon: Music,
    title: "Symphony Launcher",
    caption: "Coordinate multi-agent launches across campaigns, content, and research.",
    status: "ready",
    bullets: ["Launch sequencing", "Crew coordination", "Output checkpoints"]
  },
  "/live-research": {
    icon: Search,
    title: "Live Research",
    caption: "Track market signals, offer angles, and competitor intelligence.",
    status: "watching",
    bullets: ["Trend discovery", "Competitor watch", "Offer validation"]
  },
  "/operations-guide": {
    icon: BookOpen,
    title: "Operations Guide",
    caption: "Canonical guide for command center procedures and production readiness.",
    status: "published",
    bullets: ["Launch checklist", "Incident steps", "Publishing rules"]
  },
  "/ghoststream": {
    icon: Orbit,
    title: "GhostStream",
    caption: "Anonymous content signal layer for always-on distribution monitoring.",
    status: "watching",
    bullets: ["Stream health", "Channel routing", "Asset observability"]
  },
  "/gs-factory": {
    icon: Factory,
    title: "GS Factory",
    caption: "Factory floor for GhostStream batch production and queue control.",
    status: "queued",
    bullets: ["Batch assembly", "Queue readiness", "Output storage"]
  },
  "/agent-engine": {
    icon: Bot,
    title: "Agent Engine",
    caption: "Model assignment, tool controls, and runtime status for autonomous crews.",
    status: "online",
    bullets: ["Model routing", "Tool permissions", "Runtime controls"]
  },
  "/tools-services": {
    icon: Wrench,
    title: "Tools & Services",
    caption: "Integration map for AI gateways, email, analytics, storage, and CRM services.",
    status: "mapped",
    bullets: ["Service registry", "Credential readiness", "Health checks"]
  },
  "/budget-tracker": {
    icon: WalletCards,
    title: "Budget Tracker",
    caption: "TokenGuard budget oversight for AI spend, campaign spend, and daily limits.",
    status: "guarded",
    bullets: ["Daily AI budget", "Spend alerts", "Campaign controls"]
  },
  "/compliance": {
    icon: ClipboardCheck,
    title: "Compliance",
    caption: "Review claims, content readiness, and publishing policy requirements.",
    status: "active",
    bullets: ["Claim review", "Policy checks", "Approval history"]
  },
  "/system-online": {
    icon: Power,
    title: "System Online",
    caption: "Live heartbeat, deployment mode, and command layer availability.",
    status: "online",
    bullets: ["Telemetry stream", "API heartbeat", "Mode status"]
  }
} satisfies Record<string, { icon: LucideIcon; title: string; caption: string; status: string; bullets: string[] }>;

const crewColors = ["#00f0ff", "#7c3cff", "#23ffb1", "#ff3df2", "#ffd166"];

export function App() {
  const [location] = useLocation();
  const pulse = useTelemetryPulse();
  const mode = useQuery({ queryKey: ["system-mode"], queryFn: () => apiGet<SystemMode>("/api/system-mode") });
  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: () => apiGet<DashboardSnapshot>("/api/dashboard") });
  const agents = useQuery({ queryKey: ["agents"], queryFn: () => apiGet<AgentRecord[]>("/api/agents") });
  const campaigns = useQuery({ queryKey: ["campaigns"], queryFn: () => apiGet<CampaignRecord[]>("/api/campaigns") });
  const content = useQuery({ queryKey: ["content"], queryFn: () => apiGet<ContentRecord[]>("/api/content") });
  const videos = useQuery({ queryKey: ["videos"], queryFn: () => apiGet<VideoShortRecord[]>("/api/videos") });
  const email = useQuery({ queryKey: ["email"], queryFn: () => apiGet<EmailCampaignRecord[]>("/api/email") });
  const crm = useQuery({ queryKey: ["crm"], queryFn: () => apiGet<CrmContactRecord[]>("/api/crm") });
  const journeys = useQuery({ queryKey: ["journeys"], queryFn: () => apiGet<CustomerJourneyRecord[]>("/api/journeys") });
  const abTests = useQuery({ queryKey: ["ab-tests"], queryFn: () => apiGet<AbTestRecord[]>("/api/ab-tests") });
  const logs = useQuery({ queryKey: ["activity"], queryFn: () => apiGet<SystemLogRecord[]>("/api/activity") });
  const alerts = useQuery({ queryKey: ["alerts"], queryFn: () => apiGet<EmergencyAlertRecord[]>("/api/alerts") });

  const ready = mode.data && dashboard.data;

  return (
    <div className="shell">
      <Sidebar currentPath={location} />
      <main className="main-panel">
        <div className="grid-drift" />
        <Header mode={mode.data} pulse={pulse} />
        {mode.data && !mode.data.isLive ? (
          <ForecastBanner target={mode.data.deploymentTarget} />
        ) : (
          <div className="live-banner">Live Production mode is active for {mode.data?.deploymentTarget}.</div>
        )}

        {!ready ? (
          <LoadingState />
        ) : (
          <Switch>
            <Route path="/">
              <CommandCenter
                snapshot={dashboard.data}
                mode={mode.data}
                agents={agents.data ?? []}
                campaigns={campaigns.data ?? []}
                alerts={alerts.data ?? []}
              />
            </Route>
          <Route path="/governor-chat">
            <ModulePage details={moduleDetails["/governor-chat"]} />
          </Route>
          <Route path="/morning-briefing">
            <MorningBriefing campaigns={campaigns.data ?? []} alerts={alerts.data ?? []} />
          </Route>
            <Route path="/agents">
              <AgentSwarm agents={agents.data ?? []} />
            </Route>
            <Route path="/content">
            <ContentPipeline content={content.data ?? []} />
          </Route>
          <Route path="/video-production">
            <VideoProduction videos={videos.data ?? []} />
          </Route>
          <Route path="/marketing-studio">
            <MarketingStudio campaigns={campaigns.data ?? []} email={email.data ?? []} isLive={mode.data.isLive} />
          </Route>
          <Route path="/campaigns">
            <CampaignsPage campaigns={campaigns.data ?? []} isLive={mode.data.isLive} />
          </Route>
          <Route path="/skill-creator">
            <ModulePage details={moduleDetails["/skill-creator"]} />
          </Route>
          <Route path="/guvnor-relay">
            <ModulePage details={moduleDetails["/guvnor-relay"]} />
          </Route>
          <Route path="/client-oversight">
            <ClientOversight campaigns={campaigns.data ?? []} contacts={crm.data ?? []} />
          </Route>
          <Route path="/clients">
            <ClientsPage contacts={crm.data ?? []} />
          </Route>
          <Route path="/symphony-launcher">
            <ModulePage details={moduleDetails["/symphony-launcher"]} />
          </Route>
          <Route path="/live-research">
            <ModulePage details={moduleDetails["/live-research"]} />
          </Route>
          <Route path="/operations-guide">
            <ModulePage details={moduleDetails["/operations-guide"]} />
          </Route>
          <Route path="/ghoststream">
            <ModulePage details={moduleDetails["/ghoststream"]} />
          </Route>
          <Route path="/gs-factory">
            <ModulePage details={moduleDetails["/gs-factory"]} />
            </Route>
            <Route path="/marketing">
              <MarketingHub campaigns={campaigns.data ?? []} email={email.data ?? []} isLive={mode.data.isLive} />
            </Route>
          <Route path="/email-marketing">
            <EmailMarketingPage email={email.data ?? []} />
          </Route>
            <Route path="/crm">
              <CrmHub contacts={crm.data ?? []} />
            </Route>
            <Route path="/journeys">
            <JourneysPage journeys={journeys.data ?? []} />
          </Route>
          <Route path="/ab-testing">
            <AbTestingPage abTests={abTests.data ?? []} />
          </Route>
          <Route path="/agent-engine">
            <ModulePage details={moduleDetails["/agent-engine"]} metrics={[`${agents.data?.length ?? 0} agents registered`, `${dashboard.data.activeAgents} active agents`]} />
            </Route>
            <Route path="/security">
              <SecurityVault mode={mode.data} />
            </Route>
          <Route path="/tools-services">
            <ModulePage details={moduleDetails["/tools-services"]} />
          </Route>
          <Route path="/budget-tracker">
            <ModulePage details={moduleDetails["/budget-tracker"]} metrics={[`${currency(dashboard.data.aiSpendTodayCents)} planned AI budget`, `${currency(dashboard.data.targetRevenueCents)} 90-day target`]} />
          </Route>
          <Route path="/compliance">
            <ModulePage details={moduleDetails["/compliance"]} metrics={[`${content.data?.length ?? 0} assets tracked`, `${alerts.data?.length ?? 0} alerts visible`]} />
          </Route>
            <Route path="/activity">
              <ActivityLogs logs={logs.data ?? []} alerts={alerts.data ?? []} />
            </Route>
          <Route path="/system-online">
            <SystemOnline mode={mode.data} pulse={pulse} />
          </Route>
            <Route path="/admin">
              <AdminConsole mode={mode.data} />
            </Route>
          </Switch>
        )}
      </main>
    </div>
  );
}

function useTelemetryPulse() {
  const [lastPulse, setLastPulse] = useState<string>("connecting");

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);

    socket.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(String(event.data)) as { type: string; payload?: { timestamp?: string } };
        setLastPulse(message.payload?.timestamp ?? new Date().toISOString());
      } catch {
        setLastPulse(new Date().toISOString());
      }
    });

    socket.addEventListener("close", () => setLastPulse("offline"));
    return () => socket.close();
  }, []);

  return lastPulse;
}

function Sidebar({ currentPath }: { currentPath: string }) {
  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <div className="brand-mark">
          <Orbit size={28} />
        </div>
        <div>
          <p>THE</p>
          <h1>GOVERNER</h1>
          <span className="brand-subtitle">AI Marketing Engine</span>
        </div>
      </div>

      {navSections.map((section) => (
        <nav key={section.label} className="nav-section" aria-label={section.label}>
          <span>{section.label}</span>
          {section.items
            .filter((item) => !item.hidden)
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              return (
                <Link key={item.href} href={item.href} className={isActive ? "nav-link active" : "nav-link"}>
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
        </nav>
      ))}

      <div className="sidebar-card">
        <ShieldCheck size={18} />
        <strong>Production gate</strong>
        <span>Publish DB schema, set secrets, then enable `/admin` live mode.</span>
      </div>
    </aside>
  );
}

function Header({ mode, pulse }: { mode?: SystemMode; pulse: string }) {
  return (
    <header className="hero">
      <div className="particle p1" />
      <div className="particle p2" />
      <div className="particle p3" />
      <div>
        <div className="eyebrow">
          <Sparkles size={16} /> Autonomous affiliate marketing command layer
        </div>
        <h2>AI image revenue engine with 67-agent orchestration.</h2>
        <p>
          Monitor content generation, campaign economics, email attribution, customer journeys, and production deployment
          readiness from one stealth dashboard.
        </p>
      </div>
      <div className="hero-status">
        <StatusPill tone={mode?.isLive ? "success" : "forecast"}>{mode?.isLive ? "Live Production" : "Forecast Mode"}</StatusPill>
        <span>Telemetry: {pulse === "offline" ? "offline" : pulse === "connecting" ? "connecting" : "streaming"}</span>
      </div>
    </header>
  );
}

function ForecastBanner({ target }: { target: string }) {
  return (
    <div className="forecast-banner">
      <BrainCircuit size={18} />
      <span>
        Pre-launch simulation and forecast framing is active. Production target is <strong>{target}</strong>; publish schema
        changes and configure required secrets before enabling live mode.
      </span>
    </div>
  );
}

function CommandCenter({
  snapshot,
  mode,
  agents,
  campaigns,
  alerts
}: {
  snapshot: DashboardSnapshot;
  mode: SystemMode;
  agents: AgentRecord[];
  campaigns: CampaignRecord[];
  alerts: EmergencyAlertRecord[];
}) {
  const crewData = useMemo(() => summarizeCrews(agents), [agents]);

  return (
    <div className="page-grid">
      <section className="metric-grid">
        <MetricCard icon={Rocket} label="Revenue Captured" value={currency(snapshot.revenueCents)} sublabel={`${currency(snapshot.targetRevenueCents)} 90-day target`} />
        <MetricCard icon={Bot} label="Agents Active" value={`${snapshot.activeAgents}/${snapshot.totalAgents}`} sublabel="Across 10 specialized crews" />
        <MetricCard icon={Megaphone} label="Campaigns Live" value={String(snapshot.campaignsLive)} sublabel={mode.isLive ? "Real spend enabled" : "Forecast spend hidden"} />
        <MetricCard icon={DatabaseZap} label={mode.isLive ? "AI Spend Today" : "Planned AI Budget"} value={currency(snapshot.aiSpendTodayCents)} sublabel="TokenGuard monitored" />
      </section>

      <section className="panel wide">
        <PanelHeader icon={BarChart3} title="Revenue Trajectory" caption="Forecast trend until live production mode is enabled." />
        <div className="chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={snapshot.trend}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#7c3cff" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(value) => `$${Number(value) / 1000}k`} />
              <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #1e293b", color: "#f8fafc" }} formatter={(value) => currency(Number(value))} />
              <Area type="monotone" dataKey="revenueCents" stroke="#00f0ff" fill="url(#revenue)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={Orbit} title="Crew Distribution" caption="Visible sample of the 67-agent swarm." />
        <div className="chart small">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={crewData} dataKey="value" nameKey="name" innerRadius={46} outerRadius={76} paddingAngle={4}>
                {crewData.map((entry, index) => (
                  <Cell key={entry.name} fill={crewColors[index % crewColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #1e293b", color: "#f8fafc" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="legend-list">
          {crewData.map((crew, index) => (
            <span key={crew.name}>
              <i style={{ background: crewColors[index % crewColors.length] }} /> {crew.name}
            </span>
          ))}
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={Siren} title="Morning Briefing" caption="Executive snapshot and red flags." />
        <div className="briefing-list">
          {alerts.map((alert) => (
            <article key={alert.id}>
              <StatusPill tone="warning">{alert.severity}</StatusPill>
              <h3>{alert.title}</h3>
              <p>{alert.description}</p>
            </article>
          ))}
          <article>
            <StatusPill tone="success">nominal</StatusPill>
            <h3>Campaign economics guarded</h3>
            <p>{campaigns.length} campaign workstreams are visible with ROAS and revenue attribution ready for live data.</p>
          </article>
        </div>
      </section>
    </div>
  );
}

function AgentSwarm({ agents }: { agents: AgentRecord[] }) {
  return (
    <section className="panel page-panel">
      <PanelHeader icon={Bot} title="Agent Swarm" caption="Crew filtering, control hooks, and model assignment overview." />
      <div className="agent-grid">
        {agents.map((agent) => (
          <article key={agent.id} className="agent-card">
            <div>
              <StatusPill tone={agent.status === "running" ? "success" : agent.status === "watching" ? "forecast" : "muted"}>{agent.status}</StatusPill>
              <h3>{agent.name}</h3>
              <p>{agent.objective}</p>
            </div>
            <dl>
              <div>
                <dt>Crew</dt>
                <dd>{agent.crew}</dd>
              </div>
              <div>
                <dt>Model</dt>
                <dd>{agent.model}</dd>
              </div>
              <div>
                <dt>Success</dt>
                <dd>{percent(agent.successRate)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function MorningBriefing({ campaigns, alerts }: { campaigns: CampaignRecord[]; alerts: EmergencyAlertRecord[] }) {
  return (
    <section className="panel page-panel">
      <PanelHeader icon={Newspaper} title="Morning Briefing" caption="Executive snapshot, active risks, and campaign economics." />
      <div className="briefing-list">
        {alerts.map((alert) => (
          <article key={alert.id}>
            <StatusPill tone={alert.isResolved ? "success" : "warning"}>{alert.severity}</StatusPill>
            <h3>{alert.title}</h3>
            <p>{alert.description}</p>
          </article>
        ))}
        <article>
          <StatusPill tone="success">nominal</StatusPill>
          <h3>{campaigns.length} campaign workstreams guarded</h3>
          <p>ROAS, spend visibility, and revenue attribution are staged for production review.</p>
        </article>
      </div>
    </section>
  );
}

function ContentPipeline({ content }: { content: ContentRecord[] }) {
  return (
    <section className="panel page-panel">
      <PanelHeader icon={Clapperboard} title="Content Pipeline" caption="Generation, compliance, and publish readiness." />
      <DataTable
        columns={["Asset", "Channel", "Status", "Compliance", "Reach"]}
        rows={content.map((item) => [
          item.title,
          item.channel,
          <StatusPill key="status" tone="forecast">{item.status}</StatusPill>,
          percent(item.complianceScore),
          <span key="reach">{compact(item.estimatedReach)} {item.isEstimatedReachSample ? <SampleTag /> : null}</span>
        ])}
      />
    </section>
  );
}

function VideoProduction({ videos }: { videos: VideoShortRecord[] }) {
  return (
    <section className="panel page-panel">
      <PanelHeader icon={Clapperboard} title="Video Production" caption="Neon 9:16 rendering queue and storage status." />
      <div className="video-list">
        {videos.map((video) => (
          <article key={video.id}>
            <div>
              <h3>{video.title}</h3>
              <p>{video.platform} / {video.durationSeconds}s / style: {video.style}</p>
            </div>
            <StatusPill tone={video.status === "rendered" ? "success" : "forecast"}>{video.status}</StatusPill>
          </article>
        ))}
      </div>
    </section>
  );
}

function MarketingStudio({ campaigns, email, isLive }: { campaigns: CampaignRecord[]; email: EmailCampaignRecord[]; isLive: boolean }) {
  return (
    <div className="two-column">
      <CampaignsPage campaigns={campaigns} isLive={isLive} contained />
      <EmailMarketingPage email={email} contained />
    </div>
  );
}

function MarketingHub({ campaigns, email, isLive }: { campaigns: CampaignRecord[]; email: EmailCampaignRecord[]; isLive: boolean }) {
  return (
    <div className="two-column">
      <CampaignsPage campaigns={campaigns} isLive={isLive} contained />
      <EmailMarketingPage email={email} contained />
    </div>
  );
}

function CampaignsPage({ campaigns, isLive, contained = false }: { campaigns: CampaignRecord[]; isLive: boolean; contained?: boolean }) {
  const className = contained ? "panel" : "panel page-panel";

  return (
    <section className={className}>
      <PanelHeader icon={Megaphone} title="Campaigns" caption="Client-linked attribution and platform economics." />
      <DataTable
        columns={["Campaign", "Platform", "Status", "Spend", "Revenue", "ROAS"]}
        rows={campaigns.map((campaign) => [
          campaign.name,
          campaign.platform,
          <StatusPill key="status" tone={campaign.status === "live" ? "success" : "forecast"}>{campaign.status}</StatusPill>,
          isLive ? currency(campaign.spendCents) : <span className="forecast-value" key="spend">hidden until live</span>,
          currency(campaign.revenueCents),
          Number(campaign.roas) > 0 ? `${campaign.roas}x` : "pending"
        ])}
      />
    </section>
  );
}

function EmailMarketingPage({ email, contained = false }: { email: EmailCampaignRecord[]; contained?: boolean }) {
  const className = contained ? "panel" : "panel page-panel";

  return (
    <section className={className}>
      <PanelHeader icon={Mail} title="Email Marketing" caption="Resend-ready sends, opens, clicks, and revenue." />
      <DataTable
        columns={["Campaign", "Status", "Sent", "Open Rate", "Click Rate", "Revenue"]}
        rows={email.map((campaign) => [
          campaign.name,
          <StatusPill key="status" tone={campaign.status === "sent" ? "success" : "forecast"}>{campaign.status}</StatusPill>,
          compact(campaign.sent),
          percent((campaign.opens / Math.max(campaign.sent, 1)) * 100),
          percent((campaign.clicks / Math.max(campaign.sent, 1)) * 100),
          currency(campaign.revenueCents)
        ])}
      />
    </section>
  );
}

function CrmHub({ contacts }: { contacts: CrmContactRecord[] }) {
  return (
    <section className="panel page-panel">
      <PanelHeader icon={Users} title="CRM + Leads" caption="Real-contact journey foundation with pipeline visibility." />
      <div className="pipeline">
        {contacts.map((contact) => (
          <article key={contact.id}>
            <h3>{contact.name}</h3>
            <p>{contact.email}</p>
            <StatusPill tone="forecast">{contact.stage}</StatusPill>
            <strong>{currency(contact.lifetimeValueCents)}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function ClientOversight({ campaigns, contacts }: { campaigns: CampaignRecord[]; contacts: CrmContactRecord[] }) {
  return (
    <div className="two-column">
      <section className="panel">
        <PanelHeader icon={UserCheck} title="Client Oversight" caption="Client health, campaign ownership, and revenue exposure." />
        <div className="readiness-list">
          <ReadinessItem label={`${contacts.length} client contacts in CRM`} status="ready" />
          <ReadinessItem label={`${campaigns.length} active campaign workstreams`} status="ready" />
          <ReadinessItem label="Spend visibility guarded until live mode" status="pending" />
        </div>
      </section>
      <section className="panel">
        <PanelHeader icon={Handshake} title="Client Commitments" caption="High-touch workstreams that need operator review." />
        <div className="briefing-list">
          {contacts.slice(0, 3).map((contact) => (
            <article key={contact.id}>
              <StatusPill tone="forecast">{contact.stage}</StatusPill>
              <h3>{contact.name}</h3>
              <p>{currency(contact.lifetimeValueCents)} lifetime value tracked in CRM.</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ClientsPage({ contacts }: { contacts: CrmContactRecord[] }) {
  return (
    <section className="panel page-panel">
      <PanelHeader icon={BriefcaseBusiness} title="Clients" caption="Client roster, lifecycle stage, and value pipeline." />
      <div className="pipeline">
        {contacts.map((contact) => (
          <article key={contact.id}>
            <h3>{contact.name}</h3>
            <p>{contact.email}</p>
            <StatusPill tone="forecast">{contact.stage}</StatusPill>
            <strong>{currency(contact.lifetimeValueCents)}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function JourneyLab({ journeys, abTests }: { journeys: CustomerJourneyRecord[]; abTests: AbTestRecord[] }) {
  return (
    <div className="two-column">
      <JourneysPage journeys={journeys} contained />
      <AbTestingPage abTests={abTests} contained />
    </div>
  );
}

function JourneysPage({ journeys, contained = false }: { journeys: CustomerJourneyRecord[]; contained?: boolean }) {
  const className = contained ? "panel" : "panel page-panel";

  return (
    <section className={className}>
      <PanelHeader icon={RouteIcon} title="Journeys" caption="Enroll, advance, and complete real CRM contacts." />
      <DataTable
        columns={["Journey", "Status", "Enrollments", "Completions"]}
        rows={journeys.map((journey) => [
          journey.name,
          <StatusPill key="status" tone="success">{journey.status}</StatusPill>,
          compact(journey.enrollments),
          compact(journey.completions)
        ])}
      />
    </section>
  );
}

function AbTestingPage({ abTests, contained = false }: { abTests: AbTestRecord[]; contained?: boolean }) {
  const className = contained ? "panel" : "panel page-panel";

  return (
    <section className={className}>
      <PanelHeader icon={FlaskConical} title="A/B Testing" caption="Variant assignment, conversion tracking, winner selection." />
      <DataTable
        columns={["Test", "Status", "A", "B", "Winner", "Conversions"]}
        rows={abTests.map((test) => [
          test.name,
          <StatusPill key="status" tone={test.status === "complete" ? "success" : "forecast"}>{test.status}</StatusPill>,
          test.variantA,
          test.variantB,
          test.winner ?? "collecting data",
          compact(test.conversions)
        ])}
      />
    </section>
  );
}

function SecurityVault({ mode }: { mode: SystemMode }) {
  return (
    <div className="two-column">
      <section className="panel">
        <PanelHeader icon={KeyRound} title="API Key Vault" caption="Encrypted secret-management readiness." />
        <div className="readiness-list">
          <ReadinessItem label="AES-256 vault contract" status="ready" />
          <ReadinessItem label="ADMIN_TOKEN gated deployment controls" status={mode.isLive ? "required" : "pending"} />
          <ReadinessItem label="AI_INTEGRATIONS gateway secrets" status="external" />
          <ReadinessItem label="Resend sender + webhook secret" status="external" />
        </div>
      </section>
      <section className="panel">
        <PanelHeader icon={ShieldCheck} title="Production Prerequisites" caption="Checklist before publishing to guvnorregent.xyz." />
        <ul className="checklist">
          <li>Run the Publish DB-schema flow for Drizzle tables.</li>
          <li>Set DATABASE_URL, ADMIN_TOKEN, and API_KEY_VAULT_SECRET.</li>
          <li>Configure RESEND_FROM_EMAIL on a verified domain.</li>
          <li>Verify AI gateway secrets exist in development and production.</li>
          <li>Use `/admin` only after production dependencies are configured.</li>
        </ul>
      </section>
    </div>
  );
}

function ActivityLogs({ logs, alerts }: { logs: SystemLogRecord[]; alerts: EmergencyAlertRecord[] }) {
  return (
    <div className="two-column">
      <section className="panel">
        <PanelHeader icon={Activity} title="Real-Time Activity Logs" caption="Swarm, token, and deployment observability." />
        <div className="log-stream">
          {logs.map((log) => (
            <article key={log.id}>
              <StatusPill tone={log.level === "warn" ? "warning" : "muted"}>{log.level}</StatusPill>
              <span>{log.message}</span>
            </article>
          ))}
        </div>
      </section>
      <section className="panel">
        <PanelHeader icon={Siren} title="Emergency Alerts" caption="Open operational red flags." />
        <div className="briefing-list">
          {alerts.map((alert) => (
            <article key={alert.id}>
              <StatusPill tone={alert.isResolved ? "success" : "warning"}>{alert.severity}</StatusPill>
              <h3>{alert.title}</h3>
              <p>{alert.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminConsole({ mode }: { mode: SystemMode }) {
  const queryClient = useQueryClient();
  const [adminToken, setAdminToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: async (isLive: boolean) => {
      const response = await fetch("/api/system-mode", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken
        },
        body: JSON.stringify({ isLive })
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({ error: "Unable to update deployment mode." }))) as { error?: string };
        throw new Error(body.error ?? "Unable to update deployment mode.");
      }

      return response.json() as Promise<SystemMode>;
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["system-mode"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to update deployment mode.");
    }
  });

  return (
    <section className="panel page-panel admin-console">
      <PanelHeader icon={ToggleRight} title="Deployment Console" caption="Hidden live switch for production publishing." />
      <DemoBanner>
        This console changes persisted deployment mode only after `ADMIN_TOKEN` is configured. Use it after schema publish and
        secret verification.
      </DemoBanner>
      <div className="admin-grid">
        <label>
          Admin token
          <input value={adminToken} onChange={(event) => setAdminToken(event.target.value)} type="password" placeholder="x-admin-token" />
        </label>
        <div className="admin-actions">
          <button disabled={mutation.isPending || mode.isLive} onClick={() => mutation.mutate(true)}>
            Enable Live Production
          </button>
          <button disabled={mutation.isPending || !mode.isLive} onClick={() => mutation.mutate(false)} className="ghost-button">
            Return to Forecast
          </button>
        </div>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <p className="console-note">
        Current mode: <strong>{mode.isLive ? "Live Production" : "Pre-Launch Forecast"}</strong> for {mode.deploymentTarget}.
      </p>
    </section>
  );
}

function ModulePage({
  details,
  metrics = []
}: {
  details: (typeof moduleDetails)[keyof typeof moduleDetails];
  metrics?: string[];
}) {
  const Icon = details.icon;

  return (
    <section className="panel page-panel module-page">
      <PanelHeader icon={Icon} title={details.title} caption={details.caption} />
      <div className="module-hero">
        <div>
          <StatusPill tone="forecast">{details.status}</StatusPill>
          <h3>{details.title} command surface</h3>
          <p>{details.caption}</p>
        </div>
        <div className="module-metrics">
          {[...metrics, ...details.bullets].slice(0, 4).map((metric) => (
            <span key={metric}>{metric}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SystemOnline({ mode, pulse }: { mode: SystemMode; pulse: string }) {
  return (
    <section className="panel page-panel module-page">
      <PanelHeader icon={Power} title="System Online" caption="Live heartbeat, deployment mode, and command layer availability." />
      <div className="readiness-list">
        <ReadinessItem label="Command center API" status="ready" />
        <ReadinessItem label={`Telemetry ${pulse === "offline" ? "offline" : pulse === "connecting" ? "connecting" : "streaming"}`} status={pulse === "offline" ? "pending" : "ready"} />
        <ReadinessItem label={`Deployment target ${mode.deploymentTarget}`} status={mode.isLive ? "ready" : "pending"} />
      </div>
    </section>
  );
}

function MetricCard({ icon: Icon, label, value, sublabel }: { icon: LucideIcon; label: string; value: string; sublabel: string }) {
  return (
    <article className="metric-card">
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{sublabel}</p>
    </article>
  );
}

function PanelHeader({ icon: Icon, title, caption }: { icon: LucideIcon; title: string; caption: string }) {
  return (
    <div className="panel-header">
      <div>
        <Icon size={20} />
        <h2>{title}</h2>
      </div>
      <p>{caption}</p>
    </div>
  );
}

function DataTable({ columns, rows }: { columns: string[]; rows: Array<Array<ReactNode>> }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ children, tone = "muted" }: { children: ReactNode; tone?: "success" | "warning" | "forecast" | "muted" }) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}

function ReadinessItem({ label, status }: { label: string; status: string }) {
  return (
    <div className="readiness-item">
      <span>{label}</span>
      <StatusPill tone={status === "ready" ? "success" : status === "pending" ? "warning" : "forecast"}>{status}</StatusPill>
    </div>
  );
}

function LoadingState() {
  return (
    <section className="panel page-panel">
      <PanelHeader icon={Radar} title="Connecting to command layer" caption="Loading system mode and dashboard snapshot." />
      <div className="loading-bar" />
    </section>
  );
}

function summarizeCrews(agents: AgentRecord[]) {
  const counts = new Map<string, number>();
  agents.forEach((agent) => counts.set(agent.crew, (counts.get(agent.crew) ?? 0) + 1));
  return [...counts.entries()].map(([name, value]) => ({ name, value }));
}
