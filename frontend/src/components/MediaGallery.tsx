import { useEffect, useRef, useState } from "react";
import { MediaCard, MediaItem } from "./MediaCard";

export function MediaGallery({
  items,
  loadMore,
  hasMore,
}: {
  items: MediaItem[];
  loadMore?: () => void;
  hasMore?: boolean;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const visible = items.slice(0, page * 12);

  useEffect(() => {
    if (!hasMore || !loadMore) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPage((p) => p + 1);
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );
    if (sentinel.current) obs.observe(sentinel.current);
    return () => obs.disconnect();
  }, [hasMore, loadMore]);

  if (!items.length) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-700 py-16 text-center text-slate-500">
        No media yet. Upload photos to get started.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((m) => (
          <MediaCard key={m.id} item={m} />
        ))}
      </div>
      {hasMore && <div ref={sentinel} className="h-8" />}
    </>
  );
}
