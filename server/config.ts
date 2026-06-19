export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: process.env.DATABASE_URL,
  adminToken: process.env.ADMIN_TOKEN,
  deploymentTarget: process.env.DEPLOYMENT_TARGET ?? "https://guvnorregent.xyz",
  aiGatewayBaseUrl: process.env.AI_INTEGRATIONS_BASE_URL,
  openAiKey: process.env.OPENAI_API_KEY,
  anthropicKey: process.env.ANTHROPIC_API_KEY,
  geminiKey: process.env.GEMINI_API_KEY
};

export function requireAdminToken(headerValue: string | string[] | undefined) {
  if (!config.adminToken) {
    return { ok: false as const, status: 503, message: "ADMIN_TOKEN is required before deployment controls can be changed." };
  }

  const suppliedToken = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  if (suppliedToken !== config.adminToken) {
    return { ok: false as const, status: 401, message: "Invalid admin token." };
  }

  return { ok: true as const };
}
