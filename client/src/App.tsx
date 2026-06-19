import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BarChart3,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Clapperboard,
  DatabaseZap,
  FlaskConical,
  KeyRound,
  Mail,
  Megaphone,
  Orbit,
  Radar,
  Rocket,
  Route as RouteIcon,
  ShieldCheck,
  Siren,
  Sparkles,
  Terminal,
  ToggleRight,
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
      { href: "/agents", label: "Agent Swarm", icon: Bot },
      { href: "/content", label: "Content + Video", icon: Clapperboard }
    ]
  },
  {
    label: "Marketing",
    items: [
      { href: "/marketing", label: "Campaigns + Email", icon: Megaphone },
      { href: "/crm", label: "CRM + Leads", icon: Users },
      { href: "/journeys", label: "Journeys + A/B", icon: RouteIcon }
    ]
  },
  {
    label: "System",
    items: [
      { href: "/security", label: "Security Vault", icon: KeyRound },
      { href: "/activity", label: "Activity Logs", icon: Activity },
      { href: "/cursor-cli", label: "Cursor CLI", icon: Terminal },
      { href: "/admin", label: "Deployment Console", icon: ToggleRight, hidden: true }
    ]
  }
];

const crewColors = ["#00f0ff", "#7c3cff", "#23ffb1", "#ff3df2", "#ffd166"];

const cliModes = [
  {
    name: "Agent",
    description: "Full access to all tools for complex coding tasks",
    shortcut: "Default"
  },
  {
    name: "Plan",
    description: "Design your approach before coding with clarifying questions",
    shortcut: "Shift+Tab, /plan, --plan, --mode=plan"
  },
  {
    name: "Ask",
    description: "Read-only exploration without making changes",
    shortcut: "/ask, --mode=ask"
  }
];

const cliReference = [
  {
    title: "Getting started",
    description: "Install the CLI on your platform, then start an interactive agent session.",
    command: `# Install (macOS, Linux, WSL)
curl https://cursor.com/install -fsS | bash

# Install (Windows PowerShell)
irm 'https://cursor.com/install?win32=true' | iex

# Run interactive session
agent`
  },
  {
    title: "Interactive mode",
    description: "Start a conversation, describe your goal, review proposed changes, and approve commands.",
    command: `# Start interactive session
agent

# Start with initial prompt
agent "refactor the auth module to use JWT tokens"`
  },
  {
    title: "Non-interactive mode",
    description: "Use print mode for scripts, CI pipelines, reviews, or repeatable automation.",
    command: `# Run with specific prompt and model
agent -p "find and fix performance issues" --model "gpt-5"

# Use with git changes included for review
agent -p "review these changes for security issues" --output-format text`
  },
  {
    title: "Cloud Agent handoff",
    description: "Prepend & to any message to continue a task in Cloud Agent while you are away.",
    command: `# Send a task to Cloud Agent mid-conversation
& refactor the auth module and add comprehensive tests`
  },
  {
    title: "Sessions",
    description: "Resume previous conversations and keep context across terminal interactions.",
    command: `# Open previous chats and resume one
agent ls

# Resume latest conversation
agent resume

# Continue the previous session
agent --continue

# Resume specific conversation
agent --resume="chat-id-here"`
  }
];

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
  const isCursorCliPage = location === "/cursor-cli";

  return (
    <div className="shell">
      <Sidebar currentPath={location} />
      <main className="main-panel">
        <div className="grid-drift" />
        {!isCursorCliPage ? (
          <>
            <Header mode={mode.data} pulse={pulse} />
            {mode.data && !mode.data.isLive ? (
              <ForecastBanner target={mode.data.deploymentTarget} />
            ) : (
              <div className="live-banner">Live Production mode is active for {mode.data?.deploymentTarget}.</div>
            )}
          </>
        ) : null}

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
            <Route path="/agents">
              <AgentSwarm agents={agents.data ?? []} />
            </Route>
            <Route path="/content">
              <ContentStudio content={content.data ?? []} videos={videos.data ?? []} />
            </Route>
            <Route path="/marketing">
              <MarketingHub campaigns={campaigns.data ?? []} email={email.data ?? []} isLive={mode.data.isLive} />
            </Route>
            <Route path="/crm">
              <CrmHub contacts={crm.data ?? []} />
            </Route>
            <Route path="/journeys">
              <JourneyLab journeys={journeys.data ?? []} abTests={abTests.data ?? []} />
            </Route>
            <Route path="/security">
              <SecurityVault mode={mode.data} />
            </Route>
            <Route path="/activity">
              <ActivityLogs logs={logs.data ?? []} alerts={alerts.data ?? []} />
            </Route>
            <Route path="/cursor-cli">
              <CursorCliGuide />
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

function ContentStudio({ content, videos }: { content: ContentRecord[]; videos: VideoShortRecord[] }) {
  return (
    <div className="two-column">
      <section className="panel">
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

      <section className="panel">
        <PanelHeader icon={Clapperboard} title="Autonomous Video Factory" caption="Neon 9:16 rendering queue and storage status." />
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
    </div>
  );
}

function MarketingHub({ campaigns, email, isLive }: { campaigns: CampaignRecord[]; email: EmailCampaignRecord[]; isLive: boolean }) {
  return (
    <div className="two-column">
      <section className="panel">
        <PanelHeader icon={Megaphone} title="Campaign Manager" caption="Client-linked attribution and platform economics." />
        <DataTable
          columns={["Campaign", "Platform", "Status", isLive ? "Spend" : "Spend", "Revenue", "ROAS"]}
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

      <section className="panel">
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
    </div>
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

function JourneyLab({ journeys, abTests }: { journeys: CustomerJourneyRecord[]; abTests: AbTestRecord[] }) {
  return (
    <div className="two-column">
      <section className="panel">
        <PanelHeader icon={RouteIcon} title="Customer Journeys" caption="Enroll, advance, and complete real CRM contacts." />
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

      <section className="panel">
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
    </div>
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

function CursorCliGuide() {
  return (
    <section className="panel page-panel cli-guide">
      <div className="cli-hero">
        <div>
          <div className="eyebrow">
            <Terminal size={16} /> Cursor CLI
          </div>
          <h2>AI agents directly from your terminal.</h2>
          <p>
            Cursor CLI lets you interact with AI agents to write, review, and modify code from an interactive terminal
            interface or print automation for scripts and CI pipelines.
          </p>
        </div>
        <StatusPill tone="forecast">terminal-ready</StatusPill>
      </div>

      <div className="cli-reference-grid">
        {cliReference.map((section) => (
          <article key={section.title} className="cli-reference-card">
            <h3>{section.title}</h3>
            <p>{section.description}</p>
            <CodeBlock>{section.command}</CodeBlock>
          </article>
        ))}
      </div>

      <section className="cli-section">
        <PanelHeader icon={Terminal} title="Modes" caption="Switch with slash commands, shortcuts, or the --mode flag." />
        <div className="mode-grid">
          {cliModes.map((mode) => (
            <article key={mode.name} className="mode-card">
              <StatusPill tone={mode.name === "Agent" ? "success" : "forecast"}>{mode.name}</StatusPill>
              <p>{mode.description}</p>
              <code>{mode.shortcut}</code>
            </article>
          ))}
        </div>
      </section>

      <div className="cli-feature-grid">
        <article>
          <h3>Sandbox controls</h3>
          <p>
            Configure command execution with <code>/sandbox</code> or <code>--sandbox enabled</code> and{" "}
            <code>--sandbox disabled</code>. Settings persist across sessions.
          </p>
        </article>
        <article>
          <h3>Max mode</h3>
          <p>
            Toggle Max Mode on supported models with <code>/max-mode</code>.
          </p>
        </article>
        <article>
          <h3>Sudo password prompting</h3>
          <p>
            Cursor displays a secure masked password prompt when a command needs sudo. The password flows directly to
            sudo through secure IPC and is never visible to the AI model.
          </p>
        </article>
      </div>
    </section>
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

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="code-block">
      <code>{children}</code>
    </pre>
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
