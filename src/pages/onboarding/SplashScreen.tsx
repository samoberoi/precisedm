import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const BloodDrop = ({ size = 48 }: { size?: number }) => (
  <svg
    width={size}
    height={size * 1.3}
    viewBox="0 0 48 62"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M24 3C24 3 4 23 4 38C4 48.493 12.507 57 23 57H25C35.493 57 44 48.493 44 38C44 23 24 3 24 3Z"
      fill="hsl(var(--destructive))"
    />
    <ellipse cx="17" cy="33" rx="3.5" ry="6" fill="hsl(var(--background))" opacity="0.25" />
  </svg>
);

const SplashScreen = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1400),
      setTimeout(() => setStep(3), 2200),
      setTimeout(() => navigate("/onboarding/welcome"), 3400),
    ];

    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 pb-32 bg-background">
      <div className="flex items-center justify-center select-none" style={{ minHeight: 80 }}>
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="relative"
            >
              <div className="flex items-stretch rounded-sm border-[3px] border-primary bg-primary">
                <div className="m-[3px] mr-0 flex items-center bg-background px-5 py-2.5">
                  <span className="whitespace-nowrap text-3xl font-black italic leading-none tracking-wide text-foreground sm:text-4xl">
                    PRECISE
                  </span>
                </div>

                {step >= 3 && <div style={{ width: 28 }} />}

                <AnimatePresence>
                  {step >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="flex items-center overflow-hidden"
                    >
                      <span className="whitespace-nowrap px-5 py-2.5 text-3xl font-black italic leading-none tracking-wide text-primary-foreground sm:text-4xl">
                        DM
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {step >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute z-10"
                    style={{
                      left: "50%",
                      top: "-30%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <BloodDrop size={50} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SplashScreen;
