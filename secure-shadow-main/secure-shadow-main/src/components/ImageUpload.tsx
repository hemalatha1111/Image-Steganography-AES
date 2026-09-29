import { motion } from "framer-motion";
import { Upload, Image, X } from "lucide-react";
import { useState, useCallback } from "react";

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  selectedImage?: string | null;
  onClear?: () => void;
}

export const ImageUpload = ({ onImageSelect, selectedImage, onClear }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onImageSelect(file, event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onImageSelect(file, event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelect]
  );

  if (selectedImage) {
    return (
      <motion.div
        className="relative rounded-xl overflow-hidden border border-cyber-cyan/30"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Selected image preview */}
        <div className="aspect-video relative">
          <img
            src={selectedImage}
            alt="Selected"
            className="w-full h-full object-cover"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          
          {/* Success indicator */}
          <motion.div
            className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-green/20 border border-cyber-green/30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Image className="w-4 h-4 text-cyber-green" />
            <span className="text-sm text-cyber-green font-medium">Image Ready</span>
          </motion.div>
        </div>

        {/* Clear button */}
        {onClear && (
          <motion.button
            className="absolute top-4 right-4 p-2 rounded-full bg-background/80 border border-border hover:border-destructive/50 hover:bg-destructive/10 transition-all"
            onClick={onClear}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </motion.button>
        )}

        {/* Scanning effect */}
        <motion.div
          className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"
          initial={{ top: 0 }}
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${
        isDragging
          ? "border-cyber-cyan bg-cyber-cyan/5"
          : "border-border hover:border-cyber-cyan/50 hover:bg-muted/30"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label className="block cursor-pointer">
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileInput}
        />
        
        <div className="p-8 md:p-12 text-center">
          {/* Icon */}
          <motion.div
            className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center"
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Upload
              className={`w-8 h-8 transition-colors ${
                isDragging ? "text-cyber-cyan" : "text-muted-foreground"
              }`}
            />
          </motion.div>

          {/* Text */}
          <h4 className="font-display font-semibold text-foreground mb-2">
            {isDragging ? "Drop your image here" : "Upload an image"}
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop or click to select
          </p>

          {/* Supported formats */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
            <span className="px-2 py-1 rounded bg-muted/50">PNG</span>
            <span className="px-2 py-1 rounded bg-muted/50">JPG</span>
            <span className="px-2 py-1 rounded bg-muted/50">WEBP</span>
            <span className="px-2 py-1 rounded bg-muted/50">BMP</span>
          </div>
        </div>
      </label>

      {/* Corner accents */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyber-cyan/30 rounded-tl" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyber-cyan/30 rounded-tr" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyber-cyan/30 rounded-bl" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyber-cyan/30 rounded-br" />
    </motion.div>
  );
};

export default ImageUpload;
