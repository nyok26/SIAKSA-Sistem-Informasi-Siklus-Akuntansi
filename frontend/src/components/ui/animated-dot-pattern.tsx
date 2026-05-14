import { cn } from "@/lib/utils";
import React from "react";
import { SVGMotionProps, motion } from "framer-motion";

interface DotPatternProps extends SVGMotionProps<SVGSVGElement> {
  width?: number;
  height?: number;
  cr?: number;
  className?: string;
}

export function AnimatedDotPattern({
  width = 24,
  height = 24,
  cr = 1.5,
  className,
  ...props
}: DotPatternProps) {
  const id = React.useId();

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <motion.svg
        className="absolute h-[200%] w-[200%] fill-slate-300"
        initial={{ x: 0, y: 0 }}
        animate={{ x: -width, y: -height }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 3,
          ease: "linear",
        }}
        {...props}
      >
        <defs>
          <pattern
            id={id}
            width={width}
            height={height}
            patternUnits="userSpaceOnUse"
            patternContentUnits="userSpaceOnUse"
          >
            <circle cx={width / 2} cy={height / 2} r={cr} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </motion.svg>
    </div>
  );
}
