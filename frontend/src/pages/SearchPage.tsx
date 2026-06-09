import { useState } from "react";
import { api } from "../lib/api";
import { MediaGallery } from "../components/MediaGallery";
import { MediaItem } from "../components/MediaCard";

export function SearchPage() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [uploader, setUploader] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (tag) params.set("tag", tag);
      if (uploader) params.set("uploader", uploader);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const data = await api<MediaItem[]>(`/media/search?${params}`);
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Advanced search</h1>
      <form onSubmit={search} className="card grid gap-3 p-6 md:grid-cols-2">
        <input className="input" placeholder="Keyword (event, title, tags…)" value={q} onChange={(e) => setQ(e.target.value)} />
        <input className="input" placeholder="Tag (e.g. crowd, sports)" value={tag} onChange={(e) => setTag(e.target.value)} />
        <input className="input" placeholder="Uploader name" value={uploader} onChange={(e) => setUploader(e.target.value)} />
        <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button type="submit" className="btn-primary md:col-span-2" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>
      <MediaGallery items={results} />
    </div>
  );
}
