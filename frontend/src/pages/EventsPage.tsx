import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useState } from "react";
import { useAuth } from "../lib/auth";

type Event = {
  id: string;
  name: string;
  description?: string;
  date: string;
  category: string;
  clubName: string;
  isPublic: boolean;
  _count: { media: number; albums: number };
};

export function EventsPage() {
  const { user } = useAuth();
  const [sort, setSort] = useState("date");
  const [category, setCategory] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    category: "cultural",
    clubName: "",
    isPublic: true,
  });

  const { data: events = [], refetch } = useQuery({
    queryKey: ["events", sort, category],
    queryFn: () => {
      const params = new URLSearchParams({ sort });
      if (category) params.set("category", category);
      return api<Event[]>(`/events?${params}`);
    },
  });

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    await api("/events", { method: "POST", body: JSON.stringify(form) });
    setShowCreate(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">Events</h1>
        {user && ["ADMIN", "PHOTOGRAPHER", "CLUB_MEMBER"].includes(user.role) && (
          <button type="button" className="btn-primary" onClick={() => setShowCreate(!showCreate)}>
            Create event
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="date">Sort by date</option>
          <option value="name">Sort by name</option>
          <option value="category">Sort by category</option>
        </select>
        <input
          className="input max-w-xs"
          placeholder="Filter category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      {showCreate && (
        <form onSubmit={createEvent} className="card grid gap-3 p-6 md:grid-cols-2">
          <input className="input" placeholder="Event name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <input className="input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <input className="input" placeholder="Club name" value={form.clubName} onChange={(e) => setForm({ ...form, clubName: e.target.value })} required />
          <textarea className="input md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
            Public event
          </label>
          <button type="submit" className="btn-primary md:col-span-2">Save event</button>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {events.map((ev) => (
          <Link key={ev.id} to={`/events/${ev.id}`} className="card block p-6 transition hover:border-brand-600">
            <p className="text-xs uppercase tracking-wide text-brand-500">{ev.category}</p>
            <h2 className="mt-1 font-display text-xl font-semibold">{ev.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{ev.clubName}</p>
            <p className="mt-3 text-sm text-slate-500">
              {new Date(ev.date).toLocaleDateString()} · {ev._count.media} media · {ev._count.albums} albums
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
