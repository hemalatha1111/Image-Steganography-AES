import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 mb-8 md:mb-12">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={index} className="flex items-center">
            {/* Step circle */}
            <motion.div
              className="relative flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  isCompleted
                    ? "bg-cyber-cyan border-cyber-cyan"
                    : isCurrent
                    ? "border-cyber-cyan bg-cyber-cyan/10"
                    : "border-border bg-muted/50"
                }`}
                animate={
                  isCurrent
                    ? {
                        boxShadow: [
                          "0 0 0 0 hsl(172 100% 50% / 0)",
                          "0 0 0 10px hsl(172 100% 50% / 0.1)",
                          "0 0 0 0 hsl(172 100% 50% / 0)",
                        ],
                      }
                    : {}
                }
                transition={{ duration: 2, repeat: Infinity }}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-background" strokeWidth={3} />
                ) : (
                  <span
                    className={`font-display font-semibold text-sm ${
                      isCurrent ? "text-cyber-cyan" : "text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </span>
                )}
              </motion.div>

              {/* Step label - hidden on mobile */}
              <motion.span
                className="hidden md:block absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <span
                  className={`${
                    isCurrent ? "text-cyber-cyan" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
              </motion.span>
            </motion.div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <motion.div
                className="w-8 md:w-16 lg:w-24 h-0.5 mx-2 rounded-full overflow-hidden bg-border"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <motion.div
                  className="h-full bg-cyber-cyan origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
