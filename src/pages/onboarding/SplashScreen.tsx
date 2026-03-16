import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [animDone, setAnimDone] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 pb-32 bg-background">
      {/* Logo Animation */}
      <div className="flex items-center justify-center select-none">
        {/* PRECISE text */}
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
          className="text-3xl font-extrabold tracking-widest text-primary border-2 border-primary px-3 py-1.5 leading-none"
        >
          PRECISE
        </motion.span>

        {/* Blood drop */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.6, duration: 0.45, ease: "easeOut" }}
          className="relative -mx-1 z-10"
        >
          <svg
            width="36"
            height="46"
            viewBox="0 0 36 46"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-md"
          >
            <path
              d="M18 2C18 2 4 18 4 28C4 35.732 10.268 42 18 42C25.732 42 32 35.732 32 28C32 18 18 2 18 2Z"
              fill="#DC2626"
              stroke="#DC2626"
              strokeWidth="1.5"
            />
            {/* Highlight */}
            <ellipse cx="13" cy="24" rx="3" ry="5" fill="white" opacity="0.3" />
          </svg>
        </motion.div>

        {/* DM text */}
        <motion.span
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1, duration: 0.5, ease: "easeOut" }}
          className="text-3xl font-extrabold tracking-widest text-primary-foreground bg-primary px-3 py-1.5 border-2 border-primary leading-none"
        >
          DM
        </motion.span>
      </div>

      {/* Welcome text fades in after logo */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.3, duration: 0.5 }}
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
