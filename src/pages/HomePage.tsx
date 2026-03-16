import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Info, ArrowUpRight, Search } from "lucide-react";

import heroDoctor from "@/assets/hero-doctor.jpg";
import diaformCard from "@/assets/diaform-card.jpg";
import diaformIcon from "@/assets/diaform-card-icon.png";
import gestationIcon from "@/assets/gestation-card-icon.png";
import maintenanceIcon from "@/assets/maintenance-icon.png";
import videosIcon from "@/assets/videos-icon.png";
import steroidIcon from "@/assets/steroid-icon.png";
import PreciseLogo from "@/components/PreciseLogo";

const toolkitItems = [
  { label: "DiaForm", desc: "Initial Dosing", image: diaformIcon, route: "/diaform", gradient: "linear-gradient(135deg, hsl(210,80%,50%), hsl(210,90%,40%))", iconBg: "bg-white/15" },
  { label: "Gestation", desc: "Pregnancy Care", image: gestationIcon, route: "/gestation", gradient: "linear-gradient(135deg, hsl(15,80%,55%), hsl(10,75%,45%))", iconBg: "bg-white/15" },
  { label: "Maintenance", desc: "Ongoing Doses", image: maintenanceIcon, route: "/maintenance", gradient: "linear-gradient(135deg, hsl(45,85%,50%), hsl(35,80%,42%))", iconBg: "bg-white/15" },
  { label: "Steroid", desc: "Steroid Dosing", image: steroidIcon, route: "/steroid", gradient: "linear-gradient(135deg, hsl(200,30%,22%), hsl(200,25%,15%))", iconBg: "bg-white/15" },
];

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      if (data) navigate("/admin", { replace: true });
    });
  }, [user, navigate]);

  const { firstName } = useProfile();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-28"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <PreciseLogo size={36} variant="icon" />
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/disclaimer")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm"
          >
            <Info className="h-[18px] w-[18px] text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20 overflow-hidden"
          >
            <span className="text-sm font-bold text-primary">{firstName?.charAt(0) || "U"}</span>
          </button>
        </div>
      </div>

      {/* Doctor Hero Card */}
      <div className="px-5 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-3xl h-[220px]"
          style={{
            background: "linear-gradient(135deg, hsl(197 50% 85%), hsl(197 40% 75%), hsl(200 30% 65%))",
          }}
        >
          {/* Doctor image */}
          <img
            src={heroDoctor}
            alt="Healthcare"
            className="absolute right-0 top-0 h-full w-3/5 object-cover object-top"
            style={{ maskImage: "linear-gradient(to left, black 50%, transparent 100%)", WebkitMaskImage: "linear-gradient(to left, black 50%, transparent 100%)" }}
          />
          {/* Text overlay */}
          <div className="relative z-10 p-6 flex flex-col justify-end h-full">
            <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Welcome back</p>
            <h1 className="text-[28px] font-extrabold text-foreground leading-[1.1] mt-1 tracking-tight">
              {firstName || "User"}
            </h1>
            <p className="text-xs text-foreground/50 mt-2 max-w-[160px] leading-relaxed">
              Your personalized diabetes management toolkit
            </p>
          </div>
        </motion.div>
      </div>

      {/* Section: Let's find your tool */}
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-[22px] font-extrabold text-foreground leading-tight tracking-tight">
              Let's find<br />
              <span className="text-foreground">your tool</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => navigate("/videos")}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border shadow-sm"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Toolkit Grid - 2x2 */}
      <div className="px-5">
        <div className="grid grid-cols-2 gap-3">
          {toolkitItems.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                onClick={() => navigate(item.route)}
                className="relative flex flex-col items-start rounded-2xl p-4 text-left transition-all active:scale-[0.97] shadow-lg"
                style={{ minHeight: 130, background: item.gradient }}
              >
                <p className="text-base font-bold leading-tight text-white">
                  {item.label}
                </p>
                <p className="text-xs mt-0.5 text-white/60">
                  {item.desc}
                </p>
                <div className="flex-1" />
                <div className="flex items-end justify-between w-full mt-3">
                  <img src={item.image} alt={item.label} className="h-10 w-10 object-contain opacity-40" />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.button>
          ))}
        </div>
      </div>

      {/* Videos Row */}
      <div className="px-5 pt-4">
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          onClick={() => navigate("/videos")}
          className="w-full flex items-center gap-4 rounded-2xl p-4 text-left active:scale-[0.98] transition-transform shadow-lg"
          style={{ background: "linear-gradient(135deg, hsl(150,50%,40%), hsl(160,45%,30%))" }}
        >
          <img src={videosIcon} alt="Videos" className="h-10 w-10 object-contain opacity-50" />
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Educational Videos</p>
            <p className="text-xs text-white/60">Learn insulin dosing techniques</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </motion.button>
      </div>

      {/* DiaForm Feature Card */}
      <div className="px-5 pt-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative overflow-hidden rounded-3xl"
        >
          <img src={diaformCard} alt="DiaForm" className="h-48 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Featured</p>
            <p className="text-sm font-bold text-white mt-1">About DiaForm</p>
            <p className="text-xs text-white/70 mt-1 leading-relaxed line-clamp-2">
              An innovative insulin dosing tool for trained healthcare providers across a range of clinical scenarios.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage;
