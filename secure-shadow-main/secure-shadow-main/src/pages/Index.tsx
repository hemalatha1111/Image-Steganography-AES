import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Key, Image, Shield, Eye, Lock, Layers } from "lucide-react";
import HeroAnimation from "@/components/HeroAnimation";
import QuoteCarousel from "@/components/QuoteCarousel";
import FeatureCard from "@/components/FeatureCard";
import CyberButton from "@/components/CyberButton";
import UserMenu from "@/components/UserMenu";

const features = [
  {
    icon: Key,
    title: "Complete Wallet Access",
    description: "Private keys grant unrestricted access to your cryptocurrency assets. One leak means total loss.",
  },
  {
    icon: Eye,
    title: "Beyond Human Detection",
    description: "Steganography embeds data at a level invisible to the naked eye and most software analysis.",
  },
  {
    icon: Image,
    title: "Hide in Plain Sight",
    description: "Images don't raise suspicion. Your secrets travel disguised as ordinary photos.",
  },
  {
    icon: Shield,
    title: "Multi-Layer Security",
    description: "Combining encryption with steganography creates a defense that drastically reduces attack vectors.",
  },
  {
    icon: Lock,
    title: "Zero Trust Storage",
    description: "Plain text storage is an easy attack target. Encoded data is meaningless without extraction.",
  },
  {
    icon: Layers,
    title: "Invisible Protection",
    description: "Even if the image is shared or accessed, hidden data remains protected and undiscoverable.",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay" />
      
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, hsl(172 100% 50% / 0.15), transparent 70%)",
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(145 100% 50% / 0.15), transparent 70%)",
          }}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Header with User Menu */}
        <header className="absolute top-0 right-0 p-6 z-20">
          <UserMenu />
        </header>

        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
          {/* Logo / Brand */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-center">
              <span className="gradient-text">Stealth</span>
              <span className="text-foreground">Vault</span>
            </h1>
            <p className="mt-2 text-center text-muted-foreground text-sm md:text-base">
              Deep Learning Powered Image Steganography for Key Security
            </p>
          </motion.div>

          {/* Main 3D Animation */}
          <HeroAnimation />

          {/* Quote Carousel */}
          <motion.div
            className="w-full max-w-4xl mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <QuoteCarousel />
          </motion.div>

          {/* CTA Button */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <CyberButton
              size="lg"
              onClick={() => navigate("/select-mode")}
            >
              Get Started
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </CyberButton>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <motion.div
              className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="w-1 h-2 rounded-full bg-cyber-cyan"
                animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </section>

        {/* Why This Matters Section */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Why This <span className="gradient-text">Matters</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                In a world of increasing digital threats, traditional security isn't enough.
                Invisibility is the ultimate defense.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        {/* What Is This Application Section */}
        <section className="py-24 px-4 relative">
          {/* Background accent */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-cyan/5 to-transparent" />
          
          <div className="max-w-4xl mx-auto relative">
            <motion.div
              className="cyber-card p-8 md:p-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="flex items-center gap-4 mb-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="p-3 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20">
                  <Shield className="w-6 h-6 text-cyber-cyan" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold">
                  What Is This Application?
                </h2>
              </motion.div>

              <motion.p
                className="text-foreground/90 text-lg leading-relaxed mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                This application secures sensitive data such as cryptocurrency private keys by converting them 
                into hexadecimal form and <span className="text-cyber-cyan font-medium">invisibly embedding</span> them 
                inside digital images.
              </motion.p>

              <motion.p
                className="text-muted-foreground leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                Even if the image is shared or accessed, the hidden data remains protected and undiscoverable 
                without the correct extraction process. Your secrets become invisible to anyone who doesn't 
                know they exist.
              </motion.p>

              {/* Decorative line */}
              <motion.div
                className="mt-8 h-px bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 1 }}
              />
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-4">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Ready to Secure Your <span className="gradient-text">Digital Assets</span>?
            </h2>
            <p className="text-muted-foreground mb-8">
              Transform your sensitive data into invisible protection. No trace, no risk.
            </p>
            <CyberButton size="lg" onClick={() => navigate("/select-mode")}>
              Begin Now
              <Lock className="w-5 h-5" />
            </CyberButton>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-border/50">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold">
                <span className="text-cyber-cyan">Stealth</span>Vault
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Invisible security for the digital age
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
