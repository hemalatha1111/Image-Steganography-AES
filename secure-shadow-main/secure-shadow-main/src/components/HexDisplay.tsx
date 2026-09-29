import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface HexDisplayProps {
  value: string;
  animate?: boolean;
}

export const HexDisplay = ({ value, animate = true }: HexDisplayProps) => {
  const [displayValue, setDisplayValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(animate);

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      return;
    }

    setIsAnimating(true);
    const hexChars = "0123456789ABCDEF";
    let iteration = 0;
    const maxIterations = 20;

    const interval = setInterval(() => {
      setDisplayValue(
        value
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return value[index];
            }
            return hexChars[Math.floor(Math.random() * 16)];
          })
          .join("")
      );

      iteration += 1;

      if (iteration > value.length || iteration > maxIterations) {
        clearInterval(interval);
        setDisplayValue(value);
        setIsAnimating(false);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [value, animate]);

  // Format hex into groups of 4 for readability
  const formatHex = (hex: string) => {
    return hex.match(/.{1,4}/g)?.join(" ") || hex;
  };

  return (
    <motion.div
      className="relative p-4 md:p-6 rounded-xl bg-muted/50 border border-border overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Scan line effect during animation */}
      {isAnimating && (
        <motion.div
          className="absolute inset-x-0 h-8 bg-gradient-to-b from-cyber-green/20 to-transparent"
          animate={{ y: [-32, 200] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Hex value display */}
      <motion.code
        className="relative block font-mono text-sm md:text-base text-cyber-green break-all leading-relaxed"
        style={{
          textShadow: isAnimating ? "0 0 10px hsl(145 100% 50% / 0.5)" : "none",
        }}
      >
        {formatHex(displayValue)}
      </motion.code>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{
          boxShadow: isAnimating
            ? [
                "inset 0 0 20px hsl(145 100% 50% / 0.1)",
                "inset 0 0 40px hsl(145 100% 50% / 0.2)",
                "inset 0 0 20px hsl(145 100% 50% / 0.1)",
              ]
            : "inset 0 0 0 transparent",
        }}
        transition={{ duration: 1, repeat: isAnimating ? Infinity : 0 }}
      />

      {/* Copy indicator */}
      <div className="absolute top-2 right-2 text-xs text-muted-foreground/50">
        HEX
      </div>
    </motion.div>
  );
};

export default HexDisplay;
