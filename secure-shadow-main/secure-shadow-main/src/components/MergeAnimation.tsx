import { motion } from "framer-motion";
import { Lock, Shield, Check } from "lucide-react";
import { useEffect, useState } from "react";

interface MergeAnimationProps {
  onComplete?: () => void;
  imagePreview?: string;
}

export const MergeAnimation = ({ onComplete, imagePreview }: MergeAnimationProps) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => {
        setPhase(4);
        onComplete?.();
      }, 5000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const hexChars = "0123456789ABCDEF";
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    char: hexChars[Math.floor(Math.random() * 16)] + hexChars[Math.floor(Math.random() * 16)],
    angle: (i / 24) * Math.PI * 2,
    delay: i * 0.05,
  }));

  return (
    <div className="relative w-full h-80 md:h-96 flex items-center justify-center overflow-hidden">
      {/* Background glow */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(172 100% 50% / 0.1) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Hex particles flowing to center */}
      {phase >= 1 && particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute font-mono text-xs text-cyber-green"
          style={{
            textShadow: "0 0 10px hsl(145 100% 50% / 0.8)",
          }}
          initial={{
            x: Math.cos(particle.angle) * 200,
            y: Math.sin(particle.angle) * 200,
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            x: phase >= 2 ? 0 : Math.cos(particle.angle) * 200,
            y: phase >= 2 ? 0 : Math.sin(particle.angle) * 200,
            opacity: phase >= 2 ? 0 : 1,
            scale: phase >= 2 ? 0 : 1,
          }}
          transition={{
            duration: 1.5,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        >
          {particle.char}
        </motion.span>
      ))}

      {/* Image frame */}
      <motion.div
        className="relative w-40 h-40 md:w-48 md:h-48 rounded-xl overflow-hidden"
        style={{
          background: imagePreview
            ? `url(${imagePreview}) center/cover`
            : "linear-gradient(135deg, hsl(225 30% 15%), hsl(225 30% 8%))",
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          boxShadow:
            phase >= 2
              ? "0 0 60px hsl(172 100% 50% / 0.4), 0 0 0 2px hsl(172 100% 50% / 0.5)"
              : "0 0 20px hsl(172 100% 50% / 0.2), 0 0 0 1px hsl(var(--border))",
        }}
        transition={{ duration: 0.8 }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--cyber-cyan) / 0.2) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--cyber-cyan) / 0.2) 1px, transparent 1px)
            `,
            backgroundSize: "16px 16px",
          }}
        />

        {/* Data absorption glow */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background:
              phase >= 2
                ? [
                    "radial-gradient(circle, hsl(145 100% 50% / 0.3), transparent)",
                    "radial-gradient(circle, hsl(145 100% 50% / 0), transparent)",
                  ]
                : "transparent",
          }}
          transition={{ duration: 1, times: [0, 1] }}
        />
      </motion.div>

      {/* Lock icon appearing */}
      <motion.div
        className="absolute"
        initial={{ scale: 0, rotate: -90, opacity: 0 }}
        animate={{
          scale: phase >= 3 ? 1 : 0,
          rotate: phase >= 3 ? 0 : -90,
          opacity: phase >= 3 ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
      >
        <div
          className="p-4 rounded-xl"
          style={{
            background: "linear-gradient(135deg, hsl(172 100% 50%), hsl(145 100% 50%))",
            boxShadow: "0 0 40px hsl(172 100% 50% / 0.6)",
          }}
        >
          <Lock className="w-8 h-8 text-background" strokeWidth={2.5} />
        </div>
      </motion.div>

      {/* Shield effect */}
      <motion.div
        className="absolute w-56 h-56 md:w-64 md:h-64 rounded-full border-2 border-cyber-cyan/30"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: phase >= 3 ? [0.8, 1.2, 1] : 0.8,
          opacity: phase >= 3 ? [0, 0.8, 0.4] : 0,
        }}
        transition={{ duration: 1.5 }}
      />

      {/* Success checkmark */}
      <motion.div
        className="absolute -bottom-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: phase >= 4 ? 1 : 0,
          y: phase >= 4 ? 0 : 20,
        }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-green/20 border border-cyber-green/30">
          <Check className="w-4 h-4 text-cyber-green" />
          <span className="text-sm text-cyber-green font-medium">Data Secured</span>
        </div>
      </motion.div>

      {/* Status text */}
      <motion.p
        className="absolute bottom-8 text-sm font-mono text-muted-foreground text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {phase === 0 && "Initializing..."}
        {phase === 1 && "Encoding data fragments..."}
        {phase === 2 && "Embedding into image matrix..."}
        {phase === 3 && "Applying security seal..."}
        {phase === 4 && "✓ Operation complete"}
      </motion.p>
    </div>
  );
};

export default MergeAnimation;
