"use client";

import { motion } from "framer-motion";

export const Spinner = () => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <motion.div
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: "4px solid rgba(255, 255, 255, 0.2)",
          borderTopColor: "#ffffff",
        }}
        animate={{ rotate: 360 }}
        transition={{
          loop: Infinity,
          ease: "linear",
          duration: 1,
        }}
      />
    </div>
  );
};
