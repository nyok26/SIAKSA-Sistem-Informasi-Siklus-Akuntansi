import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface HighlightTextProps {
  children: React.ReactNode;
  className?: string;
}

export function HighlightText({ children, className }: HighlightTextProps) {
  return (
    <motion.span
      className={cn(
        "inline-flex bg-[linear-gradient(110deg,#0f172a,45%,#64748b,55%,#0f172a)] bg-[length:200%_100%] bg-clip-text text-transparent",
        className
      )}
      initial={{ backgroundPosition: "200% 0" }}
      animate={{ backgroundPosition: "-200% 0" }}
      transition={{
        repeat: Infinity,
        duration: 3,
        ease: "linear",
      }}
    >
      {children}
    </motion.span>
  );
}
