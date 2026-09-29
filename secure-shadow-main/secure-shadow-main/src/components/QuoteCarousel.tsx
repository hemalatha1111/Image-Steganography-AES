import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const quotes = [
  "Your private keys were never meant to be visible.",
  "What if your data could hide in plain sight?",
  "Security isn't just encryption. It's invisibility.",
  "If they can't see it, they can't steal it.",
  "The most secure vault is the one no one knows exists.",
];

export const QuoteCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-24 flex items-center justify-center overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-px bg-gradient-to-r from-transparent to-cyber-cyan/50" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-px bg-gradient-to-l from-transparent to-cyber-cyan/50" />

      <AnimatePresence mode="wait">
        <motion.blockquote
          key={currentIndex}
          className="text-center px-8 max-w-3xl"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="text-xl md:text-2xl lg:text-3xl font-display font-light text-foreground/90 italic">
            "{quotes[currentIndex]}"
          </p>
        </motion.blockquote>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
        {quotes.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex 
                ? "bg-cyber-cyan w-6" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to quote ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default QuoteCarousel;
