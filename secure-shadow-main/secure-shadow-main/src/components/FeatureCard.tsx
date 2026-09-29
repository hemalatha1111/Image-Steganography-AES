import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

export const FeatureCard = ({ icon: Icon, title, description, index }: FeatureCardProps) => {
  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut" 
      }}
    >
      <div className="cyber-card p-6 md:p-8 h-full transition-all duration-500 group-hover:border-cyber-cyan/30">
        {/* Background glow on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-radial-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Icon container */}
        <motion.div
          className="relative mb-4 inline-flex"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="p-3 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20 group-hover:border-cyber-cyan/40 group-hover:bg-cyber-cyan/15 transition-all duration-300">
            <Icon className="w-6 h-6 text-cyber-cyan" strokeWidth={1.5} />
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-lg bg-cyber-cyan/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>

        {/* Content */}
        <h3 className="relative font-display font-semibold text-lg text-foreground mb-2 group-hover:text-cyber-cyan transition-colors duration-300">
          {title}
        </h3>
        <p className="relative text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export default FeatureCard;
