import numpy as np
from PIL import Image
from skimage.metrics import structural_similarity as ssim
from skimage.metrics import peak_signal_noise_ratio as psnr
import cv2

class SteganalysisDetector:
    """
    Steganalysis - Detect if an image contains hidden data
    """
    
    def detect(self, image_file) -> dict:
        """
        Analyze image for signs of steganography
        """
        image = Image.open(image_file).convert('RGB')
        image_array = np.array(image)
        
        # Multiple detection methods
        lsb_score = self._detect_lsb(image_array)
        histogram_score = self._analyze_histogram(image_array)
        noise_score = self._analyze_noise(image_array)
        
        # Combine scores
        combined_score = (lsb_score + histogram_score + noise_score) / 3
        
        # Determine if hidden data exists
        has_hidden_data = combined_score > 0.5
        
        # Try to identify method
        detected_method = 'unknown'
        if lsb_score > 0.7:
            detected_method = 'lsb'
        elif histogram_score > 0.7:
            detected_method = 'dct'
        elif noise_score > 0.7:
            detected_method = 'spread_spectrum'
        
        return {
            'has_hidden_data': has_hidden_data,
            'confidence': float(combined_score),
            'detected_method': detected_method,
            'details': {
                'lsb_score': float(lsb_score),
                'histogram_score': float(histogram_score),
                'noise_score': float(noise_score)
            }
        }
    
    def _detect_lsb(self, image: np.ndarray) -> float:
        """
        Detect LSB steganography using chi-square test
        """
        # Extract LSBs
        lsbs = image & 1
        
        # Calculate frequency of 0s and 1s
        zeros = np.sum(lsbs == 0)
        ones = np.sum(lsbs == 1)
        total = zeros + ones
        
        # Expected frequency (should be roughly equal)
        expected = total / 2
        
        # Chi-square statistic
        chi_square = ((zeros - expected) ** 2 + (ones - expected) ** 2) / expected
        
        # Normalize to 0-1 range (higher = more likely to have hidden data)
        score = min(chi_square / 1000, 1.0)
        
        return score
    
    def _analyze_histogram(self, image: np.ndarray) -> float:
        """
        Analyze histogram for anomalies
        """
        scores = []
        
        for channel in range(3):
            hist, _ = np.histogram(image[:, :, channel], bins=256, range=(0, 256))
            
            # Calculate histogram smoothness
            diff = np.diff(hist)
            smoothness = np.std(diff)
            
            # Normalize
            score = min(smoothness / 100, 1.0)
            scores.append(score)
        
        return np.mean(scores)
    
    def _analyze_noise(self, image: np.ndarray) -> float:
        """
        Analyze noise patterns
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Calculate Laplacian variance (measure of blur/noise)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        variance = laplacian.var()
        
        # Normalize
        score = min(variance / 1000, 1.0)
        
        return score
    
    def calculate_quality_metrics(self, original_file, modified_file) -> dict:
        """
        Calculate quality metrics between original and modified images
        """
        # Load images
        original = np.array(Image.open(original_file).convert('RGB'))
        modified = np.array(Image.open(modified_file).convert('RGB'))
        
        # Ensure same size
        if original.shape != modified.shape:
            modified = cv2.resize(modified, (original.shape[1], original.shape[0]))
        
        # Calculate PSNR (Peak Signal-to-Noise Ratio)
        psnr_value = psnr(original, modified, data_range=255)
        
        # Calculate SSIM (Structural Similarity Index)
        ssim_value = ssim(original, modified, channel_axis=2, data_range=255)
        
        # Calculate MSE (Mean Squared Error)
        mse_value = np.mean((original.astype(float) - modified.astype(float)) ** 2)
        
        # Calculate histogram difference
        hist_diff = self._calculate_histogram_difference(original, modified)
        
        return {
            'psnr': float(psnr_value),  # Higher is better (>40 is excellent)
            'ssim': float(ssim_value),  # Higher is better (1.0 is identical)
            'mse': float(mse_value),    # Lower is better (0 is identical)
            'histogram_difference': float(hist_diff),  # Lower is better
            'quality_assessment': self._assess_quality(psnr_value, ssim_value)
        }
    
    def _calculate_histogram_difference(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """
        Calculate histogram difference between two images
        """
        diffs = []
        
        for channel in range(3):
            hist1, _ = np.histogram(img1[:, :, channel], bins=256, range=(0, 256))
            hist2, _ = np.histogram(img2[:, :, channel], bins=256, range=(0, 256))
            
            # Normalize histograms
            hist1 = hist1 / hist1.sum()
            hist2 = hist2 / hist2.sum()
            
            # Calculate difference
            diff = np.sum(np.abs(hist1 - hist2))
            diffs.append(diff)
        
        return np.mean(diffs)
    
    def _assess_quality(self, psnr_value: float, ssim_value: float) -> str:
        """
        Provide quality assessment
        """
        if psnr_value > 40 and ssim_value > 0.95:
            return 'excellent'
        elif psnr_value > 30 and ssim_value > 0.90:
            return 'good'
        elif psnr_value > 20 and ssim_value > 0.80:
            return 'fair'
        else:
            return 'poor'
