import { useState } from "react";
import { api, uploadFiles } from "../lib/api";
import { MediaGallery } from "../components/MediaGallery";
import { MediaItem } from "../components/MediaCard";
import { Camera } from "lucide-react";

export function MyPhotosPage() {
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const uploadSelfie = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("selfie", file);
    await uploadFiles("/media/face/selfie", fd);
    alert("Selfie saved! Now find your photos.");
  };

  const findPhotos = async () => {
    setLoading(true);
    try {
      const data = await api<MediaItem[]>("/media/face/my-photos");
      setPhotos(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">My photos (face match)</h1>
      <div className="card flex flex-col gap-4 p-6 md:flex-row md:items-center">
        <Camera className="text-brand-500" size={32} />
        <div className="flex-1">
          <p className="font-medium">Step 1: Upload reference selfie</p>
          <p className="text-sm text-slate-400">
            We detect your face and match it across all event uploads.
          </p>
        </div>
        <label className="btn-primary cursor-pointer">
          Upload selfie
          <input type="file" accept="image/*" className="hidden" onChange={uploadSelfie} />
        </label>
        <button type="button" className="btn-ghost" onClick={findPhotos} disabled={loading}>
          {loading ? "Matching…" : "Find my photos"}
        </button>
      </div>
      <MediaGallery items={photos} />
    </div>
  );
}
