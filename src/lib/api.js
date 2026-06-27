/**
 * Client for the EnglishUp backend. The token is passed in by the caller
 * (AuthContext keeps it). Base URL is configurable via VITE_API_URL.
 */
const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  register: (email, password, name) => request("/api/auth/register", { method: "POST", body: { email, password, name } }),
  login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password } }),
  me: (token) => request("/api/me", { token }),
  getProgress: (token) => request("/api/progress", { token }),
  saveProgress: (progress, token) => request("/api/progress", { method: "PUT", body: { progress }, token }),
  health: () => request("/api/health"),
};

export const API_BASE = BASE;
