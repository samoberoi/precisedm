import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import onboardingImg from "@/assets/onboarding-welcome.jpg";

const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col bg-background relative"
    >
      {/* Hero image — fills top portion */}
      <div className="relative w-full flex-1 min-h-[55vh]">
        <img
          src={onboardingImg}
          alt="Doctor consulting patient"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay fading into background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      {/* Text content */}
      <div className="relative px-8 -mt-8 pb-32">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-foreground tracking-tight leading-tight"
        >
          Welcome to{"\n"}Precise DM
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-3 text-muted-foreground leading-relaxed"
        >
          Your partner in personalized diabetes management.
        </motion.p>

        {/* Pagination dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-2 mt-6 justify-center"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
        </motion.div>
      </div>

      {/* Next button */}
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

export default WelcomeScreen;
