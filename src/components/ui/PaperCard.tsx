import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface PaperCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  withTape?: boolean;
}

export function PaperCard({ children, className, withTape, ...props }: PaperCardProps) {
  return (
    <motion.div
      className={cn(
        "relative bg-white paper-shadow torn-edge p-6 sm:p-8 w-full max-w-md mx-auto",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      {...props}
    >
      {withTape && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 tape -rotate-2 z-10" />
      )}
      {children}
    </motion.div>
  );
}
