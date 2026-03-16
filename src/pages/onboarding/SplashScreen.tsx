import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logoFull from "@/assets/logo-full.png";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [animDone, setAnimDone] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 pb-32 bg-background">
      {/* Logo Animation */}
      <motion.img
        src={logoFull}
        alt="PreciseDM"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
        className="h-20 object-contain"
      />

      {/* Welcome text */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        onAnimationComplete={() => setAnimDone(true)}
        className="mt-10 text-center"
      >
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Welcome to PreciseDM
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed max-w-xs mx-auto">
          Personalized insulin dosing to optimize diabetes management.
        </p>
      </motion.div>

      {/* Next button */}
      <AnimatePresence>
        {animDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed bottom-8 left-0 right-0 px-8"
          >
            <Button
              onClick={() => navigate("/onboarding/features")}
              className="w-full h-12 rounded-xl text-base font-semibold"
            >
              Next
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SplashScreen;
