import { Link } from "react-router-dom";
import { Calendar, Search, Camera, Cloud } from "lucide-react";

export function HomePage() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-brand-900/40 to-slate-900 p-10 md:p-14">
        <h1 className="font-display max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
          Centralize club event media — upload, tag, discover.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-slate-300">
          Event-wise albums, public/private access, AI tagging, facial recognition,
          watermarked downloads, and real-time notifications.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/events" className="btn-primary">
            <Calendar size={18} /> Browse events
          </Link>
          <Link to="/search" className="btn-ghost">
            <Search size={18} /> Search media
          </Link>
          <Link to="/my-photos" className="btn-ghost">
            <Camera size={18} /> Find my photos
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Cloud,
            title: "Cloud storage",
            desc: "AWS S3 with local fallback for development.",
          },
          {
            icon: Search,
            title: "Smart search",
            desc: "Filter by event, tags, date, and uploader.",
          },
          {
            icon: Camera,
            title: "Face match",
            desc: "Upload a selfie to find all your event photos.",
          },
          {
            icon: Calendar,
            title: "Event albums",
            desc: "Organize media by event, category, and date.",
          },
        ].map((f) => (
          <div key={f.title} className="card p-6">
            <f.icon className="text-brand-500" size={28} />
            <h3 className="mt-3 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
