import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Info, Play, Pause } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import BottomNav from "@/components/BottomNav";
import SubscriptionBanner from "@/components/SubscriptionBanner";

const videos = [
  { title: "DiaForm", description: "Learn the DiaForm insulin dosing process", src: "/videos/diaform.mp4" },
  { title: "Maintenance", description: "Maintenance insulin management guide", src: "/videos/maintenance.mp4" },
  { title: "Gestation", description: "Gestational diabetes insulin protocol", src: "/videos/gestation.mp4" },
];

const VideoCard = ({ video, index }: { video: typeof videos[0]; index: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    // Seek to 1s so a thumbnail frame is visible
    el.currentTime = 1;
  }, []);

  const handleToggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.muted = false;
      el.play().catch(console.error);
      setPlaying(true);
    }
  };

  const handleEnded = () => setPlaying(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
    >
      <div
        className="relative aspect-video bg-foreground/5 cursor-pointer group"
        onClick={handleToggle}
      >
        <video
          ref={videoRef}
          src={video.src}
          muted
          playsInline
          preload="auto"
          controls={playing}
          onEnded={handleEnded}
          className="h-full w-full object-cover bg-black"
        />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 group-hover:bg-foreground/30 transition-colors">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <Play className="h-6 w-6 ml-0.5" />
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-bold text-foreground">{video.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
      </div>
    </motion.div>
  );
};

const VideosPage = () => {
  const navigate = useNavigate();
  const { firstName } = useProfile();

  return (
    <div className="min-h-screen bg-background pb-28">
      <SubscriptionBanner />
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
            <VideoCard key={video.title} video={video} index={i} />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default VideosPage;
