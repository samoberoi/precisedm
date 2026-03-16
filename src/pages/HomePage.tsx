import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Info, ArrowUpRight, Bell } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import heroDoctor from "@/assets/hero-doctor.jpg";
import diaformCard from "@/assets/diaform-card.jpg";
import diaformIcon from "@/assets/diaform-icon.png";
import gestationIcon from "@/assets/gestation-icon.png";
import maintenanceIcon from "@/assets/maintenance-icon.png";
import videosIcon from "@/assets/videos-icon.png";
import steroidIcon from "@/assets/steroid-icon.png";

const toolkitItems = [
  { label: "DiaForm", image: diaformIcon, gradient: "from-primary to-[hsl(197,80%,40%)]", route: "/diaform" },
  { label: "Gestation", image: gestationIcon, gradient: "from-[hsl(14,85%,55%)] to-[hsl(14,70%,45%)]", route: "/gestation" },
  { label: "Maintenance", image: maintenanceIcon, gradient: "from-[hsl(48,90%,55%)] to-[hsl(40,85%,45%)]", route: "/maintenance" },
  { label: "Steroid", image: steroidIcon, gradient: "from-[hsl(270,80%,60%)] to-[hsl(270,70%,45%)]", route: "/steroid" },
  { label: "Videos", image: videosIcon, gradient: "from-[hsl(90,60%,50%)] to-[hsl(90,50%,38%)]", route: "/videos" },
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
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-1">
        <div>
          <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Welcome back</p>
          <h1 className="text-2xl font-extrabold text-foreground mt-0.5">{firstName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/disclaimer")}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card border border-border shadow-sm transition-colors hover:bg-accent"
          >
            <Info className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Greeting Card */}
      <div className="px-6 pt-5 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl gradient-primary p-6 glow-primary"
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-6 -translate-x-6" />
          <div className="relative z-10">
            <p className="text-sm font-medium text-primary-foreground/80">How are you feeling</p>
            <h2 className="text-2xl font-extrabold text-primary-foreground mt-1 tracking-tight">Today!</h2>
            <p className="text-xs text-primary-foreground/70 mt-2 max-w-[200px]">
              Access your personalized diabetes management tools below.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Our Toolkit */}
      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground">Our Toolkit</h2>
          <span className="text-xs text-primary font-semibold">{toolkitItems.length} tools</span>
        </div>
        <div className="flex justify-between gap-1">
          {toolkitItems.map((item, i) => (
            <motion.button
              key={item.label}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              onClick={() => navigate(item.route)}
              className="flex flex-col items-center gap-2.5 group"
            >
              <div
                className={`flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} shadow-md transition-all group-hover:scale-110 group-hover:shadow-lg`}
              >
                <img src={item.image} alt={item.label} className="h-6 w-6 object-contain" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-3xl h-48 shadow-lg"
        >
          <img
            src={heroDoctor}
            alt="Precise DM"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-5">
            <p className="text-xs font-semibold text-primary-foreground/80 uppercase tracking-wider">Precise DM</p>
            <p className="text-lg font-extrabold text-primary-foreground mt-0.5 leading-tight">Your Partner in<br />Diabetes Care</p>
          </div>
        </motion.div>
      </div>

      {/* Learn more about DiaForm */}
      <div className="px-6 pt-2 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Learn more about DiaForm</h2>
          <button
            onClick={() => navigate("/diaform")}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-3xl bg-card border border-border shadow-sm"
        >
          <div className="relative h-36">
            <img
              src={diaformCard}
              alt="DiaForm"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
          </div>
          <div className="px-5 pb-5 -mt-4 relative z-10">
            <p className="text-sm text-muted-foreground leading-relaxed">
              DiaForm is an innovative, individualized insulin dosing tool designed for trained healthcare providers to confidently determine initial and ongoing insulin doses across a range of scenarios.
            </p>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </motion.div>
  );
};

export default HomePage;
