"use client";

import { motion } from "framer-motion";

export default function PageWrapper({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`min-h-screen flex flex-col pt-24 pb-16 ${className}`}
    >
      {children}
    </motion.div>
  );
}
