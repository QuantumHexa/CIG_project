import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { MediaGallery } from "../components/MediaGallery";
import { MediaItem } from "../components/MediaCard";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: event } = useQuery({
    queryKey: ["event", id],
    queryFn: () => api<{ id: string; name: string; description?: string; clubName: string; albums: { id: string; name: string }[] }>(`/events/${id}`),
    enabled: !!id,
  });

  const { data: media = [], refetch, isFetching } = useQuery({
    queryKey: ["event-media", id],
    queryFn: () => api<MediaItem[]>(`/media/event/${id}`),
    enabled: !!id,
    refetchOnWindowFocus: true,
  });

  if (!event) return <p className="text-slate-400">Loading event…</p>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold">{event.name}</h1>
        <p className="text-slate-400">{event.clubName}</p>
        {event.description && <p className="mt-2 max-w-2xl text-slate-300">{event.description}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {event.albums?.map((a) => (
            <span key={a.id} className="rounded-lg bg-slate-800 px-3 py-1 text-sm">
              {a.name}
            </span>
          ))}
        </div>
      </header>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{media.length} item(s)</p>
        <button type="button" className="btn-ghost py-2 text-xs" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing…" : "Refresh gallery"}
        </button>
      </div>
      <MediaGallery items={media} hasMore={media.length > 12} />
    </div>
  );
}
