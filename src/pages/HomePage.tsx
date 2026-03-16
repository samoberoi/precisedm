import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import heroDoctor from "@/assets/hero-doctor.jpg";
import diaformCard from "@/assets/diaform-card.jpg";
import diaformIcon from "@/assets/diaform-icon.png";
import gestationIcon from "@/assets/gestation-icon.png";
import maintenanceIcon from "@/assets/maintenance-icon.png";
import videosIcon from "@/assets/videos-icon.png";
import steroidIcon from "@/assets/steroid-icon.png";

const toolkitItems = [
  { label: "DiaForm", icon: null, image: diaformIcon, color: "gradient-primary", route: "/diaform" },
  { label: "Gestation", icon: null, image: gestationIcon, color: "bg-[hsl(14,85%,55%)]", route: "/gestation" },
  { label: "Maintenance", icon: null, image: maintenanceIcon, color: "bg-[hsl(48,90%,55%)]", route: "/maintenance" },
  { label: "Steroid", icon: null, image: steroidIcon, color: "bg-[hsl(270,80%,60%)]", route: "/steroid" },
  { label: "Videos", icon: null, image: videosIcon, color: "bg-[hsl(90,60%,50%)]", route: "/videos" },
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
      className="min-h-screen gradient-surface pb-28"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-10 pb-2">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Hii !!</p>
          <p className="text-lg font-bold text-foreground">{firstName}</p>
        </div>
        <button
          onClick={() => navigate("/disclaimer")}
          className="flex h-10 w-10 items-center justify-center rounded-full glass-card"
        >
          <Info className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Greeting */}
      <div className="px-6 pt-2 pb-4">
        <h1 className="text-[26px] font-extrabold text-foreground leading-tight tracking-tight">
          How are you feeling<br />Today!
        </h1>
      </div>

      {/* Our Toolkit */}
      <div className="px-6 pb-4">
        <h2 className="text-base font-bold text-foreground mb-4">Our Toolkit</h2>
        <div className="flex justify-between">
          {toolkitItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.route ? () => navigate(item.route) : undefined}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${item.color} shadow-lg transition-transform group-hover:scale-110`}
              >
                {item.image ? (
                  <img src={item.image} alt={item.label} className="h-7 w-7 object-contain" />
                ) : item.icon ? (
                  <item.icon className="h-6 w-6" />
                ) : null}
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="px-6 py-3">
        <div className="overflow-hidden rounded-2xl h-44 relative">
          <img
            src={heroDoctor}
            alt="Precise DM"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
      </div>

      {/* Learn more about DiaForm */}
      <div className="px-6 py-3">
        <h2 className="text-base font-bold text-foreground mb-3">Learn more about DiaForm</h2>
        <div className="relative overflow-hidden rounded-2xl glass-card">
          <img
            src={diaformCard}
            alt="DiaForm"
            className="h-48 w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
              DiaForm, is an innovative, individualized insulin dosing tool designed for use by trained healthcare providers to confidently determine initial and ongoing insulin doses for adult patients initiating insulin across a range of scenarios. DiaForm consists of four powerful tools: in initial insulin dosing, steroid dosing, pregnancy care, and ongoing maintenance.
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
};

export default HomePage;
