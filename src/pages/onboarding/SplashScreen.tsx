import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PreciseLogo from "@/components/PreciseLogo";

const SplashScreen = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-8 pb-32"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <PreciseLogo size={80} />
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-2xl font-bold text-foreground text-center tracking-tight"
      >
        Welcome to PreciseDM
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-3 text-muted-foreground text-center leading-relaxed max-w-xs"
      >
        Personalized insulin dosing to optimize diabetes management.
      </motion.p>

      <div className="fixed bottom-8 left-0 right-0 px-8">
        <Button
          onClick={() => navigate("/onboarding/features")}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          Next
        </Button>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
