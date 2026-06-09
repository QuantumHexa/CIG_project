import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api, uploadFiles } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Upload, X, AlertCircle, CheckCircle2 } from "lucide-react";

type Event = { id: string; name: string; albums?: { id: string; name: string }[] };

type Preview = { file: File; url: string };

function isMediaFile(file: File): boolean {
  if (file.type.startsWith("image/") || file.type.startsWith("video/")) return true;
  return /\.(jpe?g|png|gif|webp|bmp|heic|heif|mp4|webm|mov|mkv)$/i.test(file.name);
}

export function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [eventId, setEventId] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    data: events = [],
    isError: eventsError,
    error: eventsLoadError,
  } = useQuery({
    queryKey: ["events-upload"],
    queryFn: () => api<Event[]>("/events"),
  });

  useEffect(() => {
    if (events.length === 1 && !eventId) {
      setEventId(events[0]!.id);
    }
  }, [events, eventId]);

  const addFiles = (files: FileList | File[]) => {
    const list = Array.from(files).filter(isMediaFile);
    if (!list.length) {
      setError(
        "No supported files selected. Use JPG, PNG, GIF, WebP, HEIC, or MP4."
      );
      return;
    }
    setError("");
    const next = list.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews((p) => [...p, ...next]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, []);

  const removePreview = (idx: number) => {
    setPreviews((p) => {
      URL.revokeObjectURL(p[idx]!.url);
      return p.filter((_, i) => i !== idx);
    });
  };

  const submit = async () => {
    setError("");
    setSuccess("");
    if (!user) {
      setError("You must be signed in to upload.");
      return;
    }
    if (!eventId) {
      setError("Please select an event from the dropdown.");
      return;
    }
    if (!previews.length) {
      setError("Add at least one photo or video.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("eventId", eventId);
      fd.append("isPublic", String(isPublic));
      previews.forEach((p) => fd.append("files", p.file, p.file.name));
      await uploadFiles("/media/upload", fd);
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setPreviews([]);
      setSuccess(`Uploaded successfully! View them in the event gallery.`);
      queryClient.invalidateQueries({ queryKey: ["event-media", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setTimeout(() => navigate(`/events/${eventId}`), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-3xl font-bold">Upload media</h1>

      {!user && (
        <p className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <AlertCircle size={18} />
          Sign in first (e.g. photo@cig.dev / password123)
        </p>
      )}

      {eventsError && (
        <p className="text-sm text-rose-400">
          Could not load events:{" "}
          {eventsLoadError instanceof Error ? eventsLoadError.message : "unknown"}
        </p>
      )}

      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <AlertCircle size={18} /> {error}
        </p>
      )}

      {success && (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          <CheckCircle2 size={18} /> {success}
        </p>
      )}

      <label className="block text-sm font-medium text-slate-300">
        Event <span className="text-rose-400">*</span>
      </label>
      <select
        className="input"
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        required
      >
        <option value="">Select event</option>
        {events.map((ev) => (
          <option key={ev.id} value={ev.id}>
            {ev.name}
          </option>
        ))}
      </select>
      {events.length === 0 && !eventsError && (
        <p className="text-sm text-slate-500">
          No events yet. Create one on the Events page first.
        </p>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Public media (uncheck for club-only private media)
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`card flex flex-col items-center justify-center border-dashed p-12 text-center transition ${
          dragOver ? "border-brand-500 bg-brand-900/20" : ""
        }`}
      >
        <Upload className="text-brand-500" size={40} />
        <p className="mt-3 font-medium">Drag & drop photos or videos</p>
        <p className="text-sm text-slate-400">
          JPG, PNG, WebP, HEIC, MP4 · bulk upload supported
        </p>
        <label className="btn-primary mt-4 cursor-pointer">
          Choose files
          <input
            type="file"
            multiple
            accept="image/*,video/*,.heic,.heif"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {previews.map((p, i) => (
            <div
              key={p.url}
              className="relative aspect-square overflow-hidden rounded-xl bg-slate-800"
            >
              {p.file.type.startsWith("video/") ||
              /\.(mp4|webm|mov)$/i.test(p.file.name) ? (
                <video src={p.url} className="h-full w-full object-cover" />
              ) : (
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              )}
              <button
                type="button"
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1"
                onClick={() => removePreview(i)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="btn-primary w-full"
        disabled={uploading || !previews.length || !eventId}
        onClick={submit}
      >
        {uploading
          ? "Uploading & processing…"
          : !eventId
            ? "Select an event to upload"
            : `Upload ${previews.length} file(s)`}
      </button>
    </div>
  );
}
