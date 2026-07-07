// Small API client. Replaces the Supabase client.
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export function getToken(): string | null {
  return localStorage.getItem("saratube_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("saratube_token", token);
  else localStorage.removeItem("saratube_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

export const api = {
  get:  <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(data ?? {}) }),
  put:  <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(data ?? {}) }),
  del:  <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
