import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  Search,
  Upload,
  Bell,
  User,
  LogOut,
  Sparkles,
  Camera,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { useEffect, useState } from "react";
import { getSocket, disconnectSocket } from "../lib/socket";
import clsx from "clsx";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);
    socket.on("notification", () => setUnread((n) => n + 1));
    return () => disconnectSocket();
  }, [token]);

  const nav = [
    { to: "/", label: "Home", icon: Sparkles },
    { to: "/events", label: "Events", icon: Calendar },
    { to: "/search", label: "Search", icon: Search },
    { to: "/upload", label: "Upload", icon: Upload },
    { to: "/my-photos", label: "My Photos", icon: Camera, auth: true },
    { to: "/notifications", label: "Alerts", icon: Bell, auth: true },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="font-display text-xl font-bold text-brand-500">
            EventLens
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              if (item.auth && !user) return null;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={clsx(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                    location.pathname === item.to
                      ? "bg-brand-600/20 text-brand-500"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                  {item.to === "/notifications" && unread > 0 && (
                    <span className="rounded-full bg-rose-500 px-1.5 text-xs text-white">
                      {unread}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-slate-400 sm:inline">
                  {user.name} · {user.role}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="btn-ghost py-2"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary py-2">
                <User size={16} /> Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
