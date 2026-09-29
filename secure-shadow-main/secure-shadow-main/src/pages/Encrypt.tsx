import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Download, Check, AlertCircle } from "lucide-react";
import StepIndicator from "@/components/StepIndicator";
import SecureInput from "@/components/SecureInput";
import HexDisplay from "@/components/HexDisplay";
import ImageUpload from "@/components/ImageUpload";
import MergeAnimation from "@/components/MergeAnimation";
import CyberButton from "@/components/CyberButton";
import { Steganography } from "@/lib/steganography";
import { toast } from "sonner";

const steps = ["Enter Key", "Convert", "Select Image", "Secure"];

// Simple text to hex conversion
const textToHex = (text: string): string => {
  return text
    .split("")
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase())
    .join("");
};

const Encrypt = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [privateKey, setPrivateKey] = useState("");
  const [hexValue, setHexValue] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [password, setPassword] = useState("");
  const [securedBlob, setSecuredBlob] = useState<Blob | null>(null);

  const handleConvert = useCallback(() => {
    const hex = textToHex(privateKey);
    setHexValue(hex);
    setCurrentStep(1);
  }, [privateKey]);

  const handleImageSelect = useCallback((file: File, preview: string) => {
    setSelectedFile(file);
    setSelectedImage(preview);
  }, []);

  const handleMerge = useCallback(async () => {
    if (!selectedFile) return;
    
    setCurrentStep(3);
    setIsProcessing(true);

    try {
      // Use real steganography to embed data
      const blob = await Steganography.embedData(
        selectedFile,
        privateKey, // Embed original text, not hex
        password || undefined // Optional password
      );

      // Create URL for download
      const url = URL.createObjectURL(blob);
      setSelectedImage(url);
      setSecuredBlob(blob);
      
      toast.success("Data embedded successfully!");
      
      // Simulate animation time
      setTimeout(() => {
        setIsProcessing(false);
        setIsComplete(true);
      }, 2000);
    } catch (error) {
      console.error("Embedding error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to embed data");
      setIsProcessing(false);
      setCurrentStep(2); // Go back to image selection
    }
  }, [selectedFile, privateKey, password]);

  const handleMergeComplete = useCallback(() => {
    // This is now handled in handleMerge
  }, []);

  const handleDownload = useCallback(() => {
    if (securedBlob) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(securedBlob);
      link.download = "secured-image.png";
      link.click();
      toast.success("Image downloaded!");
    }
  }, [securedBlob]);

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return privateKey.length > 0;
      case 1:
        return hexValue.length > 0;
      case 2:
        return selectedImage !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      handleConvert();
    } else if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      handleMerge();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Background tunnel effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at center, transparent 40%, hsl(225 30% 3%) 100%),
              repeating-conic-gradient(from 0deg, hsl(172 100% 50% / 0.02) 0deg 10deg, transparent 10deg 20deg)
            `,
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
            <span className="gradient-text">Encrypt</span> Mode
          </motion.h1>

          <div className="w-20" /> {/* Spacer for centering */}
        </header>

        {/* Step indicator */}
        <div className="px-4 pt-4">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              {/* Step 0: Enter Private Key */}
              {currentStep === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="cyber-card p-6 md:p-8">
                    <h2 className="font-display text-xl md:text-2xl font-semibold mb-2">
                      Enter Your Private Key
                    </h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      Your key will be securely encoded and hidden within an image.
                    </p>
                    <SecureInput
                      value={privateKey}
                      onChange={setPrivateKey}
                      placeholder="Enter your private key, seed phrase, or sensitive data..."
                      label="Private Key / Sensitive Data"
                    />
                    
                    {/* Optional password field */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Password Protection (Optional)
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Add password for extra security..."
                        className="secure-input"
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Adding a password encrypts your data with AES-256 before embedding
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Hex Conversion */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="cyber-card p-6 md:p-8">
                    <h2 className="font-display text-xl md:text-2xl font-semibold mb-2">
                      Hexadecimal Encoding
                    </h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      Your key has been securely transformed into hexadecimal format.
                    </p>
                    <HexDisplay value={hexValue} animate={true} />
                    <motion.div
                      className="mt-4 flex items-center gap-2 text-cyber-green"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Data encoded successfully</span>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Image Selection */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="cyber-card p-6 md:p-8">
                    <h2 className="font-display text-xl md:text-2xl font-semibold mb-2">
                      Select Carrier Image
                    </h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      Choose an image to hide your data within. The image will appear unchanged.
                    </p>
                    <ImageUpload
                      onImageSelect={handleImageSelect}
                      selectedImage={selectedImage}
                      onClear={() => {
                        setSelectedImage(null);
                        setSelectedFile(null);
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Merge Animation & Result */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="cyber-card p-6 md:p-8">
                    {!isComplete ? (
                      <>
                        <h2 className="font-display text-xl md:text-2xl font-semibold mb-2 text-center">
                          {isProcessing ? "Securing Your Data" : "Processing..."}
                        </h2>
                        <p className="text-muted-foreground text-sm mb-6 text-center">
                          {isProcessing 
                            ? "Embedding encrypted data into the image matrix..." 
                            : "Preparing steganography algorithm..."}
                        </p>
                        {isProcessing && (
                          <MergeAnimation
                            onComplete={handleMergeComplete}
                            imagePreview={selectedImage || undefined}
                          />
                        )}
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="text-center mb-6">
                          <motion.div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyber-green/20 border-2 border-cyber-green mb-4"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <Check className="w-8 h-8 text-cyber-green" />
                          </motion.div>
                          <h2 className="font-display text-2xl font-semibold mb-2">
                            Data Secured Successfully
                          </h2>
                          <p className="text-muted-foreground text-sm">
                            Your data is now invisibly protected within the image.
                          </p>
                        </div>

                        {/* Result image preview */}
                        {selectedImage && (
                          <div className="relative rounded-xl overflow-hidden border border-cyber-green/30 mb-6">
                            <img
                              src={selectedImage}
                              alt="Secured"
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-green/20 border border-cyber-green/30">
                              <Check className="w-4 h-4 text-cyber-green" />
                              <span className="text-sm text-cyber-green font-medium">Protected</span>
                            </div>
                          </div>
                        )}

                        {/* Download button */}
                        <CyberButton
                          size="lg"
                          className="w-full"
                          onClick={handleDownload}
                        >
                          <Download className="w-5 h-5" />
                          Download Secured Image
                        </CyberButton>

                        <p className="mt-4 text-xs text-muted-foreground text-center">
                          Store this image safely. You'll need it to recover your data.
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Footer navigation */}
        {currentStep < 3 && (
          <footer className="p-6">
            <div className="max-w-2xl mx-auto flex justify-between items-center">
              <CyberButton
                variant="ghost"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </CyberButton>

              <CyberButton
                onClick={handleNext}
                disabled={!canProceed()}
              >
                {currentStep === 2 ? "Secure Data" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </CyberButton>
            </div>
          </footer>
        )}

        {/* Start over button when complete */}
        {isComplete && (
          <footer className="p-6">
            <div className="max-w-2xl mx-auto text-center">
              <CyberButton
                variant="secondary"
                onClick={() => navigate("/select-mode")}
              >
                Start New Operation
              </CyberButton>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Encrypt;
