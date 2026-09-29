import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ModeCard from "@/components/ModeCard";

const SelectMode = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, hsl(172 100% 50% / 0.05), transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <motion.button
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate("/")}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </motion.button>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Select <span className="gradient-text">Operation</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Choose whether to hide data inside an image or extract hidden data from one.
            </p>
          </motion.div>

          {/* Mode cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-3xl w-full">
            <ModeCard mode="encrypt" index={0} />
            <ModeCard mode="decrypt" index={1} />
          </div>

          {/* Security note */}
          <motion.p
            className="mt-12 text-sm text-muted-foreground/60 text-center max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            All operations are performed locally in your browser. No data is ever transmitted to external servers.
          </motion.p>
        </main>
      </div>
    </div>
  );
};

export default SelectMode;
