import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
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
  { label: "DiaForm", icon: null, image: diaformIcon, color: "bg-primary" },
  { label: "Gestation", icon: null, image: gestationIcon, color: "bg-[#f47055]" },
  { label: "Maintenance", icon: null, image: maintenanceIcon, color: "bg-[#FAE672]" },
  { label: "Steroid", icon: null, image: steroidIcon, color: "bg-[#8A38F5]" },
  { label: "Videos", icon: null, image: videosIcon, color: "bg-[#B5E962]" },
];

const reviews = [
  {
    text: "The tool is easily accessible and user friendly. Makes prescribing insulin much simpler and accurate.",
    org: "Baptist Health Adult Medicine Specialists",
    author: "K.Elaine Thrift, APRN, FNP-BC, CDE, BC-ADM",
    date: "March 2024",
  },
  {
    text: "PreciseDM has transformed how we approach insulin dosing for new diabetes patients. Highly recommended.",
    org: "Endocrine Associates of Florida",
    author: "Dr. Sarah Mitchell, MD",
    date: "June 2024",
  },
  {
    text: "An indispensable tool for any practitioner managing insulin therapy. Intuitive and evidence-based.",
    org: "Mayo Clinic Diabetes Center",
    author: "Dr. James Rivera, PharmD",
    date: "September 2024",
  },
];

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeReview, setActiveReview] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      if (data) navigate("/admin", { replace: true });
    });
  }, [user, navigate]);

  // Auto-rotate reviews
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "There";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-28"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-10 pb-2">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Hii !!</p>
          <p className="text-lg font-bold text-foreground">{firstName}</p>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 backdrop-blur-sm">
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
            <button key={item.label} className="flex flex-col items-center gap-2">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${item.color} text-primary-foreground shadow-md`}
              >
                {item.image ? (
                  <img src={item.image} alt={item.label} className="h-7 w-7 object-contain" />
                ) : item.icon ? (
                  <item.icon className="h-6 w-6" />
                ) : null}
              </div>
              <span className="text-xs font-medium text-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="px-6 py-3">
        <div className="relative overflow-hidden rounded-2xl h-44">
          <img
            src={heroDoctor}
            alt="Precise DM"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Glass overlay on left side */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/60 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-center px-6">
            <h3 className="text-2xl font-extrabold text-primary-foreground tracking-tight">
              Precise DM
            </h3>
            <p className="mt-1 text-sm text-primary-foreground/90 font-medium">
              personalized insulin dosing
            </p>
          </div>
        </div>
      </div>

      {/* Learn more about DiaForm */}
      <div className="px-6 py-3">
        <h2 className="text-base font-bold text-foreground mb-3">Learn more about DiaForm</h2>
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={diaformCard}
            alt="DiaForm"
            className="h-48 w-full object-cover"
          />
          {/* Glass text overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-sm text-primary-foreground/95 leading-relaxed font-medium">
              Precise DM's first offering to help determine the initial insulin dosage for adult
              patients with a new diagnosis of Diabetes or existing Diabetes, but new to insulin
              therapy.
            </p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="px-6 py-3">
        <h2 className="text-base font-bold text-foreground mb-3">Reviews</h2>

        <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-lg shadow-sm">
          <motion.div
            key={activeReview}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="p-5"
          >
            {/* Quoted text with glass pill */}
            <div className="rounded-xl bg-primary/10 backdrop-blur-sm p-4 mb-4">
              <p className="text-sm text-foreground/80 italic leading-relaxed">
                {reviews[activeReview].text}
              </p>
            </div>

            <p className="text-sm font-bold text-foreground">{reviews[activeReview].org}</p>
            <p className="text-xs text-muted-foreground mt-1">{reviews[activeReview].author}</p>
            <p className="text-xs text-primary font-medium mt-1">{reviews[activeReview].date}</p>
          </motion.div>

          {/* Dots */}
          <div className="flex justify-center gap-2 pb-4">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveReview(i)}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === activeReview ? "bg-primary w-4" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </motion.div>
  );
};

export default HomePage;
