import React from "react";
import { motion } from "framer-motion";

const variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 }
};

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.3 }}
    style={{ position: "relative" }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
