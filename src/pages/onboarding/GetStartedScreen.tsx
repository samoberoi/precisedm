import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import onboardingImg from "@/assets/onboarding-getstarted.png";
import logoIcon from "@/assets/logo-icon.png";

const GetStartedScreen = () => {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col bg-background relative">
      <div className="relative w-full flex-1 min-h-[55vh]">
        <img src={onboardingImg} alt="Healthcare professional" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background" />
        <div className="absolute top-12 left-5 z-10">
          <img src={logoIcon} alt="PreciseDM" className="h-10 w-10 rounded-full object-cover shadow-md" />
        </div>
      </div>
      <div className="relative px-8 -mt-8 pb-32">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="text-xs font-semibold text-primary uppercase tracking-wider">Get started</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-extrabold text-foreground tracking-tight leading-tight mt-2">
          Your journey begins here
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-3 text-muted-foreground leading-relaxed text-sm">
          Join us and take care of your health with ease and confidence.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-2 mt-6 justify-center">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
          <div className="w-6 h-2 rounded-full gradient-primary" />
        </motion.div>
      </div>
      <div className="fixed bottom-8 left-0 right-0 px-8">
        <Button onClick={() => navigate("/login")} className="w-full h-13 rounded-2xl text-base font-bold gradient-primary glow-primary flex items-center justify-center gap-2">
          Get Started <ArrowUpRight className="h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
};

export default GetStartedScreen;
