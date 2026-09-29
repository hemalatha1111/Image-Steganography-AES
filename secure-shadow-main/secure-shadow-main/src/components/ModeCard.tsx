import { motion } from "framer-motion";
import { Lock, Unlock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ModeCardProps {
  mode: "encrypt" | "decrypt";
  index: number;
}

export const ModeCard = ({ mode, index }: ModeCardProps) => {
  const navigate = useNavigate();
  const isEncrypt = mode === "encrypt";

  return (
    <motion.div
      className="group relative cursor-pointer"
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
      onClick={() => navigate(`/${mode}`)}
      whileHover={{ y: -8 }}
    >
      <div className="cyber-card p-8 md:p-12 text-center transition-all duration-500 group-hover:border-cyber-cyan/50">
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: isEncrypt
              ? "radial-gradient(ellipse at center, hsl(172 100% 50% / 0.1), transparent 70%)"
              : "radial-gradient(ellipse at center, hsl(145 100% 50% / 0.1), transparent 70%)",
          }}
        />

        {/* Animated icon container */}
        <motion.div
          className="relative mx-auto mb-6 w-24 h-24 md:w-32 md:h-32 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-cyber-cyan/20"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Inner glow circle */}
          <motion.div
            className="absolute inset-4 rounded-full"
            style={{
              background: isEncrypt
                ? "linear-gradient(135deg, hsl(172 100% 50% / 0.2), hsl(172 100% 50% / 0.05))"
                : "linear-gradient(135deg, hsl(145 100% 50% / 0.2), hsl(145 100% 50% / 0.05))",
            }}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Icon */}
          <motion.div
            className="relative z-10"
            animate={
              isEncrypt
                ? { rotate: [0, 0, -10, 0] }
                : { rotate: [0, 0, 10, 0] }
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut",
            }}
          >
            {isEncrypt ? (
              <Lock
                className="w-12 h-12 md:w-16 md:h-16 text-cyber-cyan group-hover:text-cyber-cyan transition-colors"
                strokeWidth={1.5}
              />
            ) : (
              <Unlock
                className="w-12 h-12 md:w-16 md:h-16 text-cyber-green group-hover:text-cyber-green transition-colors"
                strokeWidth={1.5}
              />
            )}
          </motion.div>

          {/* Particle effects on hover */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full ${isEncrypt ? 'bg-cyber-cyan' : 'bg-cyber-green'}`}
              style={{
                top: "50%",
                left: "50%",
              }}
              initial={{ x: 0, y: 0, opacity: 0 }}
              whileHover={{
                x: Math.cos((i / 6) * Math.PI * 2) * 60,
                y: Math.sin((i / 6) * Math.PI * 2) * 60,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                delay: i * 0.1,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>

        {/* Title */}
        <h3 className="relative font-display text-2xl md:text-3xl font-semibold mb-3 group-hover:text-cyber-cyan transition-colors duration-300">
          {isEncrypt ? "Encrypt" : "Decrypt"}
        </h3>

        {/* Subtitle */}
        <p className="relative text-muted-foreground text-sm md:text-base">
          {isEncrypt
            ? "Hide secret data inside an image"
            : "Extract hidden data from an image"}
        </p>

        {/* Bottom CTA indicator */}
        <motion.div
          className="mt-6 flex items-center justify-center gap-2 text-cyber-cyan/70 group-hover:text-cyber-cyan transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-sm font-medium">Select</span>
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            →
          </motion.span>
        </motion.div>
      </div>

      {/* Border glow effect */}
      <motion.div
        className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${isEncrypt ? 'hsl(172 100% 50% / 0.3)' : 'hsl(145 100% 50% / 0.3)'}, transparent)`,
          filter: "blur(20px)",
          zIndex: -1,
        }}
      />
    </motion.div>
  );
};

export default ModeCard;
