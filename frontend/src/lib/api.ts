import { apiUrl } from "./config";

function headers(json = true): HeadersInit {
  const token = localStorage.getItem("token");
  const h: Record<string, string> = {};
  if (token) h.Authorization = `Bearer ${token}`;
  if (json) h["Content-Type"] = "application/json";
  return h;
}

function parseError(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const o = body as { error?: string; errors?: { msg?: string }[] };
  if (o.error) return o.error;
  if (Array.isArray(o.errors) && o.errors[0]?.msg) return o.errors[0].msg;
  return fallback;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path.startsWith("/api") ? path : `/api${path}`), {
    ...init,
    headers: { ...headers(true), ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error("Please sign in to continue");
    throw new Error(parseError(err, res.statusText || "Request failed"));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function uploadFiles(
  path: string,
  formData: FormData
): Promise<unknown> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Please sign in before uploading");

  const res = await fetch(apiUrl(path.startsWith("/api") ? path : `/api${path}`), {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error("Session expired — please sign in again");
    throw new Error(parseError(err, "Upload failed"));
  }
  return res.json();
}
