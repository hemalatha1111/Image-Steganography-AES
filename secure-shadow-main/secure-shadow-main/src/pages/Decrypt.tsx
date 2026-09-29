import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Unlock, AlertTriangle, Eye, EyeOff, Copy, Check } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import CyberButton from "@/components/CyberButton";
import { Steganography } from "@/lib/steganography";
import { toast } from "sonner";

const Decrypt = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<string | null>(null);
  const [isDataVisible, setIsDataVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const handleImageSelect = useCallback((file: File, preview: string) => {
    setSelectedFile(file);
    setSelectedImage(preview);
    setExtractedData(null);
  }, []);

  const handleExtract = useCallback(async () => {
    if (!selectedFile) return;
    
    setIsExtracting(true);
    
    try {
      // Use real steganography to extract data
      const data = await Steganography.extractData(
        selectedFile,
        password || undefined // Optional password
      );
      
      setExtractedData(data);
      toast.success("Data extracted successfully!");
    } catch (error) {
      console.error("Extraction error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to extract data";
      
      // If decryption failed, might need password
      if (errorMessage.includes("password") || errorMessage.includes("Decryption")) {
        setShowPasswordInput(true);
        toast.error("Password required or incorrect");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsExtracting(false);
    }
  }, [selectedFile, password]);

  const handleCopy = useCallback(() => {
    if (extractedData) {
      navigator.clipboard.writeText(extractedData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [extractedData]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, hsl(145 100% 50% / 0.05), transparent 70%)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <motion.button
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate("/select-mode")}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </motion.button>

          <motion.h1
            className="font-display text-xl font-semibold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-cyber-green">Decrypt</span> Mode
          </motion.h1>

          <div className="w-20" />
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              {/* Upload state */}
              {!extractedData && !isExtracting && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="cyber-card p-6 md:p-8">
                    <motion.div
                      className="flex items-center gap-4 mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="p-3 rounded-lg bg-cyber-green/10 border border-cyber-green/20">
                        <Unlock className="w-6 h-6 text-cyber-green" />
                      </div>
                      <div>
                        <h2 className="font-display text-xl md:text-2xl font-semibold">
                          Extract Hidden Data
                        </h2>
                        <p className="text-muted-foreground text-sm">
                          Upload an image containing hidden data
                        </p>
                      </div>
                    </motion.div>

                    <ImageUpload
                      onImageSelect={handleImageSelect}
                      selectedImage={selectedImage}
                      onClear={() => {
                        setSelectedImage(null);
                        setSelectedFile(null);
                      }}
                    />

                    {/* Password input (optional) */}
                    {(showPasswordInput || password) && (
                      <motion.div
                        className="mt-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                      >
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Password (if encrypted)
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password..."
                          className="secure-input"
                        />
                      </motion.div>
                    )}

                    {!showPasswordInput && !password && (
                      <button
                        onClick={() => setShowPasswordInput(true)}
                        className="mt-4 text-sm text-cyber-cyan hover:underline"
                      >
                        + Add password
                      </button>
                    )}

                    {selectedImage && (
                      <motion.div
                        className="mt-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <CyberButton
                          size="lg"
                          className="w-full"
                          onClick={handleExtract}
                          disabled={isExtracting}
                        >
                          <Unlock className="w-5 h-5" />
                          {isExtracting ? "Extracting..." : "Extract Hidden Data"}
                        </CyberButton>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Extracting animation */}
              {isExtracting && (
                <motion.div
                  key="extracting"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="cyber-card p-8 md:p-12">
                    <div className="text-center">
                      <motion.h2
                        className="font-display text-xl md:text-2xl font-semibold mb-4"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Extracting Hidden Data...
                      </motion.h2>

                      {/* Extraction animation */}
                      <div className="relative w-48 h-48 mx-auto my-8">
                        {/* Image frame */}
                        <motion.div
                          className="absolute inset-0 rounded-xl overflow-hidden"
                          style={{
                            background: selectedImage
                              ? `url(${selectedImage}) center/cover`
                              : "linear-gradient(135deg, hsl(225 30% 15%), hsl(225 30% 8%))",
                          }}
                        >
                          {/* Scan line */}
                          <motion.div
                            className="absolute inset-x-0 h-2 bg-gradient-to-r from-transparent via-cyber-green to-transparent"
                            animate={{ y: [0, 192, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          />
                        </motion.div>

                        {/* Data particles flowing out */}
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-cyber-green"
                            style={{
                              left: "50%",
                              top: "50%",
                              boxShadow: "0 0 10px hsl(145 100% 50%)",
                            }}
                            animate={{
                              x: [0, Math.cos((i / 12) * Math.PI * 2) * 100],
                              y: [0, Math.sin((i / 12) * Math.PI * 2) * 100],
                              opacity: [0, 1, 0],
                              scale: [0, 1, 0.5],
                            }}
                            transition={{
                              duration: 1.5,
                              delay: i * 0.1,
                              repeat: Infinity,
                              ease: "easeOut",
                            }}
                          />
                        ))}

                        {/* Unlock icon */}
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <div className="p-4 rounded-full bg-background/80 backdrop-blur-sm">
                            <Unlock className="w-8 h-8 text-cyber-green" />
                          </div>
                        </motion.div>
                      </div>

                      <p className="text-muted-foreground text-sm">
                        Analyzing image matrix for embedded data...
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Result state */}
              {extractedData && !isExtracting && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="cyber-card p-6 md:p-8">
                    {/* Success header */}
                    <motion.div
                      className="text-center mb-6"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyber-green/20 border-2 border-cyber-green mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <Check className="w-8 h-8 text-cyber-green" />
                      </motion.div>
                      <h2 className="font-display text-2xl font-semibold mb-2">
                        Data Extracted Successfully
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        Hidden data has been recovered from the image.
                      </p>
                    </motion.div>

                    {/* Extracted data display */}
                    <div className="relative">
                      <div className="p-4 rounded-xl bg-muted border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground font-medium">
                            Recovered Data
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setIsDataVisible(!isDataVisible)}
                              className="p-1.5 rounded-lg hover:bg-muted-foreground/10 transition-colors"
                            >
                              {isDataVisible ? (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                            <button
                              onClick={handleCopy}
                              className="p-1.5 rounded-lg hover:bg-muted-foreground/10 transition-colors"
                            >
                              {copied ? (
                                <Check className="w-4 h-4 text-cyber-green" />
                              ) : (
                                <Copy className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        </div>
                        <code className="block font-mono text-sm text-foreground break-all">
                          {isDataVisible
                            ? extractedData
                            : "•".repeat(Math.min(extractedData.length, 50))}
                        </code>
                      </div>
                    </div>

                    {/* Warning */}
                    <motion.div
                      className="mt-6 flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-destructive font-medium">
                          Critical Security Warning
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Anyone with this data can access the associated wallet or account.
                          Never share it and store it securely.
                        </p>
                      </div>
                    </motion.div>

                    {/* Actions */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <CyberButton
                        variant="secondary"
                        className="flex-1"
                        onClick={() => {
                          setSelectedImage(null);
                          setSelectedFile(null);
                          setExtractedData(null);
                          setIsDataVisible(false);
                          setPassword("");
                          setShowPasswordInput(false);
                        }}
                      >
                        Extract Another
                      </CyberButton>
                      <CyberButton
                        className="flex-1"
                        onClick={() => navigate("/select-mode")}
                      >
                        Done
                      </CyberButton>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Decrypt;
