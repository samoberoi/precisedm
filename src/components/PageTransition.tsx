import { motion } from "framer-motion";
import { ReactNode } from "react";

const pageVariants = {
  initial: {
    opacity: 0,
    x: 30,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -30,
  },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.25,
};

const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
    style={{ width: "100%" }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
