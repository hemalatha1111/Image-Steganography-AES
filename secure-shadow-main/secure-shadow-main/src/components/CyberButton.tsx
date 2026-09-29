import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CyberButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const CyberButton = ({
  className,
  variant = "primary",
  size = "md",
  glow = true,
  children,
  onClick,
  disabled,
  type = "button",
}: CyberButtonProps) => {
  const baseStyles = "relative font-display font-medium rounded-xl transition-all duration-300 overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-to-r from-cyber-cyan to-cyber-green text-background hover:shadow-glow-md",
    secondary: "bg-muted border border-border text-foreground hover:border-cyber-cyan/50 hover:bg-muted/80",
    ghost: "bg-transparent text-foreground hover:bg-muted/50",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Shimmer effect for primary variant */}
      {variant === "primary" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Glow effect */}
      {glow && variant === "primary" && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{
            boxShadow: [
              "0 0 20px hsl(172 100% 50% / 0.2)",
              "0 0 40px hsl(172 100% 50% / 0.4)",
              "0 0 20px hsl(172 100% 50% / 0.2)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};

export default CyberButton;
