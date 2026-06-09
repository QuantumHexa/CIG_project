import { Heart, MessageCircle, Download, Star } from "lucide-react";

function resolveMediaUrl(url: string): string {
  if (url.startsWith("http")) return url;
  return url.startsWith("/") ? url : `/${url}`;
}
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

export type MediaItem = {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  title?: string | null;
  type: string;
  isPublic: boolean;
  tags: { label: string; source: string }[];
  uploadedBy: { id: string; name: string };
  event: { id: string; name: string; clubName: string };
  _count: { likes: number; comments: number; favorites: number };
};

export function MediaCard({ item }: { item: MediaItem }) {
  const { user } = useAuth();
  const src = resolveMediaUrl(item.thumbnailUrl || item.url);

  const like = () => {
    if (!user) return alert("Sign in to like");
    api(`/media/${item.id}/like`, { method: "POST" }).catch(alert);
  };

  const favorite = () => {
    if (!user) return alert("Sign in to save");
    api(`/media/${item.id}/favorite`, { method: "POST" }).catch(alert);
  };

  const download = () => {
    if (!user) return alert("Sign in to download (watermarked)");
    window.open(`/api/media/${item.id}/download`, "_blank");
  };

  return (
    <article className="card group overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-800">
        {item.type === "VIDEO" ? (
          <video src={resolveMediaUrl(item.url)} controls className="h-full w-full object-cover" />
        ) : (
          <img
            src={src}
            alt={item.title ?? "Event media"}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        )}
        {!item.isPublic && (
          <span className="absolute left-2 top-2 rounded-lg bg-amber-500/90 px-2 py-0.5 text-xs font-semibold text-black">
            Private
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <p className="text-sm font-medium text-white">{item.event.name}</p>
        <p className="text-xs text-slate-400">
          {item.uploadedBy.name} · {item.event.clubName}
        </p>
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 4).map((t) => (
            <span
              key={t.label}
              className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-brand-500"
            >
              #{t.label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-1 text-slate-400">
          <button type="button" onClick={like} className="hover:text-rose-400">
            <Heart size={16} /> {item._count.likes}
          </button>
          <span className="flex items-center gap-1">
            <MessageCircle size={16} /> {item._count.comments}
          </span>
          <button type="button" onClick={favorite} className="hover:text-amber-400">
            <Star size={16} />
          </button>
          <button type="button" onClick={download} className="ml-auto hover:text-white">
            <Download size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
