import { motion, useAnimationFrame } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Lock, Shield, Image } from "lucide-react";

const HexCharacter = ({ char, index, total }: { char: string; index: number; total: number }) => {
  const angle = (index / total) * Math.PI * 2;
  const radius = 180 + Math.random() * 60;
  const startX = Math.cos(angle) * radius;
  const startY = Math.sin(angle) * radius;
  const delay = index * 0.1;

  return (
    <motion.span
      className="absolute font-mono text-sm md:text-base font-medium"
      style={{
        color: `hsl(${145 + Math.random() * 30} 100% ${50 + Math.random() * 20}%)`,
        textShadow: `0 0 10px hsl(145 100% 50% / 0.8)`,
      }}
      initial={{ x: startX, y: startY, opacity: 0, scale: 0 }}
      animate={{
        x: [startX, startX * 0.3, 0],
        y: [startY, startY * 0.3, 0],
        opacity: [0, 1, 0],
        scale: [0.5, 1.2, 0],
      }}
      transition={{
        duration: 4,
        delay: delay,
        repeat: Infinity,
        repeatDelay: 2,
        ease: "easeInOut",
      }}
    >
      {char}
    </motion.span>
  );
};

const FloatingHexStream = () => {
  const hexChars = "0123456789ABCDEF";
  const streams = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: -300 + i * 85,
    chars: Array.from({ length: 12 }, () => hexChars[Math.floor(Math.random() * 16)]),
  }));

  return (
    <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
      {streams.map((stream) => (
        <div
          key={stream.id}
          className="absolute top-0 flex flex-col gap-4"
          style={{ left: `calc(50% + ${stream.x}px)` }}
        >
          {stream.chars.map((char, i) => (
            <motion.span
              key={i}
              className="font-mono text-cyber-green text-opacity-60"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 600, opacity: [0, 0.6, 0.6, 0] }}
              transition={{
                duration: 6 + Math.random() * 2,
                delay: i * 0.3 + stream.id * 0.5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>
      ))}
    </div>
  );
};

const DataParticle = ({ index }: { index: number }) => {
  const angle = Math.random() * Math.PI * 2;
  const distance = 250 + Math.random() * 150;

  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-cyber-cyan"
      style={{
        boxShadow: "0 0 6px hsl(172 100% 50%)",
      }}
      initial={{
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
      }}
      animate={{
        x: [Math.cos(angle) * distance, 0],
        y: [Math.sin(angle) * distance, 0],
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 3,
        delay: index * 0.15,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "easeInOut",
      }}
    />
  );
};

export const HeroAnimation = () => {
  const [phase, setPhase] = useState(0);
  const hexData = "4F7A2B9E1D3C8F6A";

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center">
      {/* Ambient glow background */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(172 100% 50% / 0.08) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating hex streams in background */}
      <FloatingHexStream />

      {/* Orbiting data particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <DataParticle key={i} index={i} />
      ))}

      {/* Main image frame container */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        {/* Shield aura - outer ring */}
        <motion.div
          className="absolute -inset-16 rounded-full border border-cyber-cyan/20"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Shield aura - inner ring */}
        <motion.div
          className="absolute -inset-8 rounded-full border-2 border-cyber-green/30"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Image frame with gradient border */}
        <motion.div
          className="relative w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(225 30% 15%), hsl(225 30% 8%))",
            boxShadow: `
              0 0 0 1px hsl(var(--border)),
              0 0 40px hsl(172 100% 50% / 0.2),
              0 20px 60px hsl(230 25% 3% / 0.8)
            `,
          }}
          animate={{
            boxShadow: phase >= 2 
              ? `
                  0 0 0 2px hsl(172 100% 50% / 0.5),
                  0 0 60px hsl(172 100% 50% / 0.4),
                  0 20px 60px hsl(230 25% 3% / 0.8)
                `
              : `
                  0 0 0 1px hsl(var(--border)),
                  0 0 40px hsl(172 100% 50% / 0.2),
                  0 20px 60px hsl(230 25% 3% / 0.8)
                `,
          }}
          transition={{ duration: 0.8 }}
        >
          {/* Grid pattern inside */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--cyber-cyan) / 0.1) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--cyber-cyan) / 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />

          {/* Image icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ 
                opacity: phase < 2 ? 1 : 0.3,
                scale: phase < 2 ? 1 : 0.9,
              }}
              transition={{ duration: 0.5 }}
            >
              <Image className="w-16 h-16 md:w-24 md:h-24 text-muted-foreground/50" strokeWidth={1} />
            </motion.div>
          </div>

          {/* Scan line effect */}
          <motion.div
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"
            animate={{ y: [0, 256, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Floating hex characters converging to image */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {hexData.split("").map((char, i) => (
            <HexCharacter key={i} char={char} index={i} total={hexData.length} />
          ))}
        </div>

        {/* Lock icon overlay */}
        <motion.div
          className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 z-20"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ 
            scale: phase >= 2 ? 1 : 0,
            rotate: phase >= 2 ? 0 : -45,
          }}
          transition={{ 
            duration: 0.8, 
            type: "spring",
            stiffness: 200,
            damping: 15 
          }}
        >
          <div 
            className="relative p-3 md:p-4 rounded-xl"
            style={{
              background: "linear-gradient(135deg, hsl(172 100% 50%), hsl(145 100% 50%))",
              boxShadow: "0 0 30px hsl(172 100% 50% / 0.5)",
            }}
          >
            <Lock className="w-6 h-6 md:w-8 md:h-8 text-background" strokeWidth={2.5} />
          </div>
        </motion.div>

        {/* Shield badge */}
        <motion.div
          className="absolute -top-4 -left-4 md:-top-6 md:-left-6 z-20"
          initial={{ scale: 0, rotate: 45 }}
          animate={{ 
            scale: phase >= 3 ? 1 : 0,
            rotate: phase >= 3 ? 0 : 45,
          }}
          transition={{ 
            duration: 0.8, 
            delay: 0.3,
            type: "spring",
            stiffness: 200,
            damping: 15 
          }}
        >
          <div 
            className="relative p-3 md:p-4 rounded-xl bg-muted/80 backdrop-blur-sm border border-cyber-cyan/30"
            style={{
              boxShadow: "0 0 20px hsl(172 100% 50% / 0.3)",
            }}
          >
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-cyber-cyan" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Success checkmark animation */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: phase >= 3 ? [0, 1.5, 1] : 0,
            opacity: phase >= 3 ? [0, 1, 0] : 0,
          }}
          transition={{ duration: 1.5 }}
        >
          <div className="w-full h-full rounded-2xl border-2 border-cyber-green/50" />
        </motion.div>
      </motion.div>

      {/* Status text */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <motion.p
          className="font-mono text-sm text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {phase === 0 && "Initializing secure protocol..."}
          {phase === 1 && "Encoding data fragments..."}
          {phase === 2 && "Embedding into image matrix..."}
          {phase === 3 && "✓ Data secured invisibly"}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default HeroAnimation;
