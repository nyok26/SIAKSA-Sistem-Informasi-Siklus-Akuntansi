import { cn } from "@/lib/utils";
import { HTMLMotionProps, motion } from "framer-motion";
import React from "react";

interface ShinyButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
}

export const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        {...props}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative inline-flex items-center justify-center overflow-hidden rounded-md bg-slate-900 px-6 py-2.5 font-medium text-white shadow-[0_4px_14px_0_rgb(0,0,0,10%)] transition-colors hover:bg-slate-800 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
          className
        )}
      >
        <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
          <div className="relative h-full w-8 bg-white/20" />
        </div>
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>
    );
  }
);
ShinyButton.displayName = "ShinyButton";
