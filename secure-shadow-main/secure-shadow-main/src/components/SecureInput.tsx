import { motion } from "framer-motion";
import { Eye, EyeOff, AlertTriangle, Shield } from "lucide-react";
import { useState } from "react";

interface SecureInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export const SecureInput = ({
  value,
  onChange,
  placeholder = "Enter your private key...",
  label,
}: SecureInputProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Mask the value when not visible
  const displayValue = isVisible ? value : value ? "•".repeat(Math.min(value.length, 100)) : "";

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Animated border glow */}
        <motion.div
          className="absolute -inset-px rounded-xl pointer-events-none"
          animate={{
            opacity: isFocused ? 1 : 0,
            boxShadow: isFocused
              ? "0 0 20px hsl(172 100% 50% / 0.3)"
              : "0 0 0 transparent",
          }}
          transition={{ duration: 0.3 }}
          style={{
            background: "linear-gradient(135deg, hsl(172 100% 50% / 0.2), hsl(145 100% 50% / 0.2))",
          }}
        />

        {/* Textarea - using controlled masking */}
        <textarea
          value={isVisible ? value : value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={4}
          className="w-full p-4 pr-12 rounded-xl bg-muted border border-border font-mono text-sm resize-none transition-all duration-300 focus:outline-none focus:border-cyber-cyan text-foreground"
          style={{
            color: isVisible ? undefined : "transparent",
            textShadow: isVisible ? "none" : "0 0 8px hsl(var(--foreground))",
            caretColor: "hsl(var(--cyber-cyan))",
          }}
        />
        
        {/* Masked overlay when hidden */}
        {!isVisible && value && (
          <div className="absolute top-0 left-0 right-12 bottom-0 p-4 font-mono text-sm text-foreground pointer-events-none overflow-hidden">
            {displayValue}
          </div>
        )}

        {/* Visibility toggle */}
        <motion.button
          type="button"
          className="absolute top-4 right-4 p-2 rounded-lg bg-muted/80 border border-border hover:border-cyber-cyan/50 transition-all"
          onClick={() => setIsVisible(!isVisible)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isVisible ? (
            <EyeOff className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Eye className="w-4 h-4 text-muted-foreground" />
          )}
        </motion.button>

        {/* Shield indicator */}
        <motion.div
          className="absolute bottom-4 right-4"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: value.length > 0 ? 1 : 0, scale: value.length > 0 ? 1 : 0 }}
        >
          <Shield className="w-4 h-4 text-cyber-cyan/50" />
        </motion.div>
      </div>

      {/* Security warning */}
      <motion.div
        className="mt-4 flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-destructive font-medium">Security Warning</p>
          <p className="text-xs text-muted-foreground mt-1">
            Never share your private key with anyone. Your private key grants complete access to your wallet.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SecureInput;
