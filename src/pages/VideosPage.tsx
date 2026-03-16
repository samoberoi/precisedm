import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Info, Play } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import videosIcon from "@/assets/videos-icon.png";

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
        className="relative aspect-video bg-muted cursor-pointer group"
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
          className="h-full w-full object-cover"
        />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 group-hover:bg-foreground/30 transition-colors">
            <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-lg">
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
    <div className="min-h-screen bg-background pb-36">
      <SubscriptionBanner />

      {/* Header — consistent with all other pages */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Videos</h1>
        <button onClick={() => navigate("/disclaimer")} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm">
          <Info className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Hero Card */}
      <div className="px-5 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg, hsl(150,50%,40%), hsl(160,45%,30%))" }}
        >
          <div className="relative z-10">
            <p className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">Learn</p>
            <h2 className="text-lg font-extrabold text-white mt-1">Educational Videos</h2>
            <p className="text-[11px] text-white/70 mt-1 max-w-[200px] leading-snug">Learn insulin dosing techniques with video guides</p>
          </div>
          <img src={videosIcon} alt="" className="absolute -bottom-2 -right-2 h-24 w-24 opacity-15 object-contain" />
        </motion.div>
      </div>

      <div className="px-5 mt-5 space-y-4">
        {videos.map((video, i) => (
          <VideoCard key={video.title} video={video} index={i} />
        ))}
      </div>
    </div>
  );
};

export default VideosPage;
