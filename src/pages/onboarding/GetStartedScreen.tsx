import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PreciseLogo from "@/components/PreciseLogo";

const GetStartedScreen = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen flex flex-col items-center justify-center px-8 pb-32"
    >
      <PreciseLogo size={64} />

      <h1 className="mt-8 text-2xl font-bold text-foreground text-center tracking-tight">
        Your journey begins here
      </h1>

      <p className="mt-3 text-muted-foreground text-center leading-relaxed max-w-xs">
        Join us and take care of your health with ease and confidence.
      </p>

      <div className="fixed bottom-8 left-0 right-0 px-8">
        <Button
          onClick={() => navigate("/login")}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          Get Started
        </Button>
      </div>
    </motion.div>
  );
};

export default GetStartedScreen;
