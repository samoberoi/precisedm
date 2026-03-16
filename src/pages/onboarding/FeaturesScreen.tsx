import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Syringe, Pill, Baby, Settings } from "lucide-react";

const features = [
  { icon: Syringe, label: "Initial dosing" },
  { icon: Pill, label: "Steroid dosing" },
  { icon: Baby, label: "Pregnancy care" },
  { icon: Settings, label: "Ongoing maintenance" },
];

const FeaturesScreen = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen flex flex-col px-8 pt-16 pb-32"
    >
      <h1 className="text-2xl font-bold text-foreground tracking-tight leading-tight">
        Empower your insulin dosing skills for confident diabetes management
      </h1>

      <p className="mt-4 text-muted-foreground leading-relaxed">
        Access four powerful tools designed for every stage of your diabetes management:
      </p>

      <div className="mt-8 space-y-3">
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.35 }}
            className="flex items-center gap-4 rounded-xl bg-accent/60 p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium text-foreground">{f.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="fixed bottom-8 left-0 right-0 px-8">
        <Button
          onClick={() => navigate("/onboarding/get-started")}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          Next
        </Button>
      </div>
    </motion.div>
  );
};

export default FeaturesScreen;
