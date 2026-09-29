# StealthVault - Complete Implementation Guide

## Overview

StealthVault is a comprehensive steganography application with three layers:
1. **Frontend**: React + TypeScript client-side steganography
2. **Backend API**: Node.js server with advanced algorithms
3. **ML Service**: Python-based machine learning steganography

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  - Client-side LSB steganography                        │
│  - AES-256 encryption                                   │
│  - Image processing with Canvas API                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├─────────────────┬──────────────────────┐
                 │                 │                      │
┌────────────────▼─────┐  ┌────────▼──────┐  ┌──────────▼────────┐
│   Backend API        │  │  ML Service   │  │   Future: DB      │
│   (Node.js/Express)  │  │  (Python/     │  │   (PostgreSQL)    │
│                      │  │   Flask)      │  │                   │
│  - LSB               │  │  - GAN-based  │  │  - User accounts  │
│  - DCT-based         │  │  - Deep       │  │  - Operation logs │
│  - Spread Spectrum   │  │    Learning   │  │  - Analytics      │
│  - Encryption        │  │  - Steganalysis│  │                   │
│  - Batch processing  │  │  - Quality    │  │                   │
└──────────────────────┘  └───────────────┘  └───────────────────┘
```

## Implementation Phases

### Phase 1: Client-Side Enhancement ✅ COMPLETED

**Files Created:**
- `src/lib/steganography.ts` - LSB steganography with encryption
- `src/lib/advancedStego.ts` - DCT and spread spectrum methods

**Features:**
- Real LSB steganography (not demo)
- AES-256-GCM encryption using Web Crypto API
- Capacity calculation
- PNG format support
- Password protection

**Integration Steps:**

1. Update `Encrypt.tsx` to use real steganography:

```typescript
import { Steganography } from '@/lib/steganography';

// In handleMerge function:
const handleMerge = async () => {
  try {
    const blob = await Steganography.embedData(
      selectedFile!,
      hexValue,
      password // optional
    );
    
    const url = URL.createObjectURL(blob);
    setSelectedImage(url);
    setIsComplete(true);
  } catch (error) {
    // Handle error
  }
};
```

2. Update `Decrypt.tsx` to extract data:

```typescript
import { Steganography } from '@/lib/steganography';

// In handleExtract function:
const handleExtract = async () => {
  try {
    const data = await Steganography.extractData(
      selectedFile!,
      password // optional
    );
    
    setExtractedData(data);
  } catch (error) {
    // Handle error
  }
};
```

### Phase 2: Backend API ✅ COMPLETED

**Files Created:**
- `backend/src/server.ts` - Express server
- `backend/src/controllers/stego.controller.ts` - Request handlers
- `backend/src/services/lsb.service.ts` - LSB implementation
- `backend/src/services/dct.service.ts` - DCT implementation
- `backend/src/services/spreadSpectrum.service.ts` - Spread spectrum
- `backend/src/services/encryption.service.ts` - AES encryption
- `backend/src/middleware/errorHandler.ts` - Error handling
- `backend/src/utils/cleanup.ts` - Temp file cleanup

**Setup:**

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npm run dev
```

**API Usage:**

```bash
# Embed data
curl -X POST http://localhost:3001/api/stego/embed \
  -F "image=@cover.png" \
  -F "data=secret message" \
  -F "password=mypassword" \
  -F "method=lsb" \
  -o secured.png

# Extract data
curl -X POST http://localhost:3001/api/stego/extract \
  -F "image=@secured.png" \
  -F "password=mypassword" \
  -F "method=lsb"

# Get capacity
curl -X POST http://localhost:3001/api/stego/capacity \
  -F "image=@cover.png"
```

**Frontend Integration:**

```typescript
// Create API client
const API_URL = 'http://localhost:3001/api/stego';

async function embedWithBackend(image: File, data: string, password?: string) {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('data', data);
  formData.append('method', 'dct'); // or 'lsb', 'spread'
  if (password) formData.append('password', password);

  const response = await fetch(`${API_URL}/embed`, {
    method: 'POST',
    body: formData,
  });

  return await response.blob();
}

async function extractWithBackend(image: File, password?: string) {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('method', 'dct');
  if (password) formData.append('password', password);

  const response = await fetch(`${API_URL}/extract`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  return result.data;
}
```

### Phase 3: ML Service ✅ COMPLETED

**Files Created:**
- `ml-service/app.py` - Flask server
- `ml-service/services/gan_stego.py` - GAN-based steganography
- `ml-service/services/deep_stego.py` - Deep learning encoder-decoder
- `ml-service/services/steganalysis.py` - Detection and quality metrics

**Setup:**

```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**API Usage:**

```bash
# GAN-based embedding
curl -X POST http://localhost:5000/api/ml/embed/gan \
  -F "image=@cover.png" \
  -F "data=secret" \
  -o secured-gan.png

# Steganalysis
curl -X POST http://localhost:5000/api/ml/analyze \
  -F "image=@suspicious.png"

# Quality assessment
curl -X POST http://localhost:5000/api/ml/quality \
  -F "original=@original.png" \
  -F "modified=@modified.png"
```

## Deployment Guide

### Frontend Deployment (Vercel/Netlify)

```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod

# Or Netlify
netlify deploy --prod --dir=dist
```

### Backend Deployment (Railway/Heroku)

**Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

**Deploy:**
```bash
# Railway
railway up

# Or Heroku
heroku container:push web
heroku container:release web
```

### ML Service Deployment (AWS Lambda/Google Cloud Run)

**Dockerfile:**
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY ml-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ml-service/ .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## Security Best Practices

1. **Always use HTTPS** in production
2. **Rate limiting** - Prevent abuse
3. **File size limits** - Prevent DoS
4. **Input validation** - Sanitize all inputs
5. **No data logging** - Don't log sensitive data
6. **Temp file cleanup** - Auto-delete uploaded files
7. **CORS configuration** - Restrict origins
8. **Password encryption** - Use strong key derivation (PBKDF2)

## Performance Optimization

### Frontend
- Use Web Workers for heavy computation
- Implement progressive image loading
- Cache processed images
- Lazy load components

### Backend
- Use Redis for caching
- Implement connection pooling
- Use CDN for static assets
- Enable gzip compression

### ML Service
- Use GPU acceleration (CUDA)
- Batch processing for multiple images
- Model quantization for faster inference
- Load balancing across multiple instances

## Testing

### Frontend Tests
```bash
npm run test
```

### Backend Tests
```bash
cd backend
npm run test
```

### ML Service Tests
```bash
cd ml-service
pytest
```

## Monitoring

### Metrics to Track
- Request latency
- Error rates
- File sizes processed
- API usage per endpoint
- Server resource usage

### Tools
- **Frontend**: Sentry, LogRocket
- **Backend**: Prometheus, Grafana
- **ML Service**: TensorBoard, MLflow

## Future Enhancements

### Short-term
- [ ] Add password strength indicator
- [ ] Implement drag-and-drop for images
- [ ] Add image preview comparison
- [ ] Show embedding progress
- [ ] Add capacity warning before embedding

### Medium-term
- [ ] User authentication
- [ ] Save operation history
- [ ] Batch processing UI
- [ ] Video steganography
- [ ] Mobile app (React Native)

### Long-term
- [ ] Blockchain verification
- [ ] Distributed storage integration (IPFS)
- [ ] Advanced GAN architectures
- [ ] Real-time collaboration
- [ ] Browser extension

## Troubleshooting

### Common Issues

**1. "Data too large" error**
- Solution: Use larger image or compress data

**2. "No valid hidden data found"**
- Solution: Ensure image hasn't been compressed (use PNG)

**3. "Decryption failed"**
- Solution: Check password is correct

**4. CORS errors**
- Solution: Configure CORS_ORIGIN in backend .env

**5. ML service slow**
- Solution: Enable GPU or reduce image size

## Support

For issues or questions:
- GitHub Issues: [repository]/issues
- Documentation: [repository]/wiki
- Email: support@stealthvault.com

## License

MIT License - See LICENSE file for details
