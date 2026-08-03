// Agents get a restricted portal: their own activity/float dashboard and
// support — not the client's business-wide overview, revenue, packages,
// devices, agent management, or settings/billing.

export const AGENT_HOME_PATH = '/dashboard/agent-dashboard';

export const AGENT_ALLOWED_PATHS = [AGENT_HOME_PATH, '/dashboard/support'];

export function isAgentAllowedPath(pathname: string): boolean {
  return AGENT_ALLOWED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
