/** API origin in production (e.g. https://cig-api.onrender.com). Empty = use Vite proxy in dev. */
export const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_ORIGIN ? `${API_ORIGIN}${p}` : p;
}

export function mediaUrl(url: string): string {
  if (url.startsWith("http")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return API_ORIGIN ? `${API_ORIGIN}${path}` : path;
}
