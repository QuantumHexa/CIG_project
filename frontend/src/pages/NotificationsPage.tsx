import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  actor?: { name: string };
};

export function NotificationsPage() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<Notification[]>("/notifications"),
  });

  useEffect(() => {
    api("/notifications/read-all", { method: "POST" }).then(() =>
      qc.invalidateQueries({ queryKey: ["notifications"] })
    );
  }, [qc]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Notifications</h1>
      <ul className="space-y-2">
        {items.map((n) => (
          <li
            key={n.id}
            className={`card px-4 py-3 text-sm ${n.read ? "opacity-60" : ""}`}
          >
            <span className="font-medium text-brand-500">{n.type}</span> — {n.message}
            <span className="mt-1 block text-xs text-slate-500">
              {new Date(n.createdAt).toLocaleString()}
            </span>
          </li>
        ))}
        {!items.length && (
          <p className="text-slate-500">No notifications yet. Likes, tags, and comments appear here in real time.</p>
        )}
      </ul>
    </div>
  );
}
