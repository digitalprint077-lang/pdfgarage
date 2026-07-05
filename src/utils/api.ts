/**
 * API base URL for production split deploy (Vercel frontend + external API).
 * Leave empty in local dev — Vite proxies /api to localhost:3001.
 *
 * Vercel: set VITE_API_URL=https://your-api.up.railway.app (no trailing slash)
 */
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "";

export function apiUrl(path: string): string {
  if (!path.startsWith("/")) return `${API_BASE}/${path}`;
  return `${API_BASE}${path}`;
}
