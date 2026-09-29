# StealthVault ML Service

Machine Learning powered steganography service with GAN-based embedding and steganalysis detection.

## Features

- **GAN-based Steganography**: Neural network approach for secure embedding
- **Deep Learning Encoder-Decoder**: TensorFlow-based steganography
- **Steganalysis Detection**: Detect if images contain hidden data
- **Quality Assessment**: PSNR, SSIM, MSE metrics
- **Multiple Detection Methods**: LSB, histogram, noise analysis

## Installation

### Prerequisites
- Python 3.9+
- CUDA (optional, for GPU acceleration)

### Setup
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running

### Development
```bash
python app.py
```

### Production
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Endpoints

### POST /api/ml/embed/gan
Embed data using GAN-based steganography

**Request:**
- `image`: Cover image file
- `data`: Data to embed (max 32 characters)

**Response:**
- PNG image with embedded data

### POST /api/ml/extract/gan
Extract data using GAN

**Request:**
- `image`: Stego image file

**Response:**
```json
{
  "success": true,
  "data": "extracted data",
  "length": 14
}
```

### POST /api/ml/embed/deep
Embed using deep learning encoder-decoder

**Request:**
- `image`: Cover image
- `data`: Data to embed

**Response:**
- PNG image with embedded data

### POST /api/ml/extract/deep
Extract using deep learning decoder

**Request:**
- `image`: Stego image

**Response:**
```json
{
  "success": true,
  "data": "extracted data",
  "length": 14
}
```

### POST /api/ml/analyze
Detect if image contains hidden data

**Request:**
- `image`: Image to analyze

**Response:**
```json
{
  "success": true,
  "hasHiddenData": true,
  "confidence": 0.85,
  "method": "lsb",
  "details": {
    "lsb_score": 0.9,
    "histogram_score": 0.7,
    "noise_score": 0.8
  }
}
```

### POST /api/ml/quality
Assess embedding quality

**Request:**
- `original`: Original image
- `modified`: Modified image

**Response:**
```json
{
  "success": true,
  "metrics": {
    "psnr": 42.5,
    "ssim": 0.98,
    "mse": 12.3,
    "histogram_difference": 0.05,
    "quality_assessment": "excellent"
  }
}
```

## Model Architecture

### GAN-based Steganography

**Generator:**
- Secret encoder: 256 → 512 → 1024 → 2048
- Image encoder: Conv2D layers (64, 128, 256 channels)
- Fusion layer: Combines secret and image features
- Output: Stego image (same size as input)

**Extractor:**
- Encoder: Conv2D layers with adaptive pooling
- Decoder: Fully connected layers
- Output: Extracted secret data (256 bits)

### Deep Learning Encoder-Decoder

**Encoder:**
- Input: Cover image + Secret data (as image)
- 4x Conv2D layers (64 filters each)
- Output: Stego image

**Decoder:**
- Input: Stego image
- 4x Conv2D layers (64 filters each)
- Output: Extracted secret data

## Steganalysis Methods

1. **LSB Detection**: Chi-square test on least significant bits
2. **Histogram Analysis**: Detect anomalies in color distribution
3. **Noise Analysis**: Laplacian variance for noise patterns

## Quality Metrics

- **PSNR** (Peak Signal-to-Noise Ratio): >40 dB is excellent
- **SSIM** (Structural Similarity): >0.95 is excellent
- **MSE** (Mean Squared Error): Lower is better
- **Histogram Difference**: Measures color distribution changes

## Training Models

### GAN Training
```python
from services.gan_stego import GANSteganography

gan = GANSteganography()
gan.train(cover_images, secret_data, epochs=100)
```

### Deep Learning Training
```python
from services.deep_stego import DeepSteganography

deep = DeepSteganography()
deep.train(cover_images, secret_images, epochs=50)
```

## Performance

- GAN embedding: ~2-3 seconds per image (GPU)
- Deep learning: ~1-2 seconds per image (GPU)
- Steganalysis: ~0.5-1 second per image
- CPU mode: 3-5x slower

## Security Considerations

- GAN-based methods are harder to detect than traditional LSB
- Steganalysis can detect most traditional methods
- Use encryption before embedding for maximum security
- Larger images provide better capacity and security

## Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## Environment Variables

```env
PORT=5000
DEBUG=False
CORS_ORIGIN=http://localhost:8080
MODEL_PATH=./models
```

## Future Enhancements

- [ ] Pre-trained model weights
- [ ] Batch processing support
- [ ] Video steganography
- [ ] Audio steganography
- [ ] Blockchain integration for verification
- [ ] Advanced GAN architectures (StyleGAN, CycleGAN)

## License

MIT
