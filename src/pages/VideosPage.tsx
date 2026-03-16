import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Info, Play, X } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import BottomNav from "@/components/BottomNav";

const videos = [
  { title: "DiaForm", description: "Learn the DiaForm insulin dosing process", src: "/videos/diaform.mp4" },
  { title: "Maintenance", description: "Maintenance insulin management guide", src: "/videos/maintenance.mp4" },
  { title: "Gestation", description: "Gestational diabetes insulin protocol", src: "/videos/gestation.mp4" },
];

const VideosPage = () => {
  const navigate = useNavigate();
  const { firstName } = useProfile();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="px-5 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-foreground mb-3"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Hello !!</p>
            <h1 className="text-2xl font-bold text-foreground">{firstName}</h1>
          </div>
          <button
            onClick={() => navigate("/disclaimer")}
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-border"
          >
            <Info className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>

      <div className="px-5 mt-5">
        <h2 className="text-xl font-bold text-foreground mb-4">Videos</h2>

        <div className="space-y-4">
          {videos.map((video, i) => (
            <motion.div
              key={video.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
            >
              {/* Video thumbnail / player */}
              <div
                className="relative aspect-video bg-foreground/5 cursor-pointer group"
                onClick={() => setActiveVideo(activeVideo === video.src ? null : video.src)}
              >
                {activeVideo === video.src ? (
                  <video
                    src={video.src}
                    controls
                    autoPlay
                    className="h-full w-full object-contain bg-black"
                  />
                ) : (
                  <>
                    <video
                      src={video.src}
                      muted
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 group-hover:bg-foreground/30 transition-colors">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                        <Play className="h-6 w-6 ml-0.5" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-base font-bold text-foreground">{video.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fullscreen overlay */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 md:hidden" style={{ display: "none" }}>
          <button
            onClick={() => setActiveVideo(null)}
            className="absolute top-4 right-4 text-white"
          >
            <X className="h-6 w-6" />
          </button>
          <video src={activeVideo} controls autoPlay className="max-h-full max-w-full" />
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default VideosPage;
