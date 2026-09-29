# 🔐 StealthVault - Complete Steganography Solution

> Hide your secrets in plain sight with military-grade steganography and encryption.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![Python](https://img.shields.io/badge/python-%3E%3D3.9-blue)

## 🌟 Features

### Client-Side (Browser)
- ✅ **LSB Steganography** - Hide data in image pixels
- ✅ **AES-256-GCM Encryption** - Military-grade encryption
- ✅ **Password Protection** - Secure your hidden data
- ✅ **Capacity Calculator** - Know how much data you can hide
- ✅ **Real-time Processing** - No server uploads needed
- ✅ **PNG Support** - Lossless image format

### Backend API (Node.js)
- ✅ **Multiple Algorithms**
  - LSB (Least Significant Bit)
  - DCT (Discrete Cosine Transform) - JPEG resistant
  - Spread Spectrum - Enhanced security
- ✅ **Batch Processing** - Split data across multiple images
- ✅ **Rate Limiting** - Prevent abuse
- ✅ **File Validation** - Secure uploads
- ✅ **Auto Cleanup** - Temporary file management

### ML Service (Python)
- ✅ **GAN-based Steganography** - Neural network approach
- ✅ **Deep Learning Encoder-Decoder** - TensorFlow powered
- ✅ **Steganalysis Detection** - Detect hidden data
- ✅ **Quality Assessment** - PSNR, SSIM, MSE metrics
- ✅ **GPU Acceleration** - Fast processing

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd secure-shadow-main

# Start all services
./start.sh  # Linux/Mac
start.bat   # Windows

# Access application
open http://localhost:8080
```

### Option 2: Manual Setup

#### Frontend
```bash
npm install
npm run dev
```

#### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

#### ML Service
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## 📖 Usage

### Basic Encryption

1. **Navigate to the app** at http://localhost:8080
2. **Click "Get Started"** and select "Encrypt Mode"
3. **Enter your secret data** (private key, password, etc.)
4. **Upload a cover image** (PNG recommended)
5. **Optional: Add password** for extra security
6. **Download secured image** - Looks identical to original!

### Basic Decryption

1. **Select "Decrypt Mode"**
2. **Upload the secured image**
3. **Enter password** (if you used one)
4. **Extract your secret data**

### Advanced Usage (API)

#### Embed with LSB
```bash
curl -X POST http://localhost:3001/api/stego/embed \
  -F "image=@cover.png" \
  -F "data=my secret key" \
  -F "password=mypassword" \
  -F "method=lsb" \
  -o secured.png
```

#### Embed with DCT (JPEG resistant)
```bash
curl -X POST http://localhost:3001/api/stego/embed/dct \
  -F "image=@cover.png" \
  -F "data=my secret key" \
  -F "password=mypassword" \
  -F "strength=10" \
  -o secured-dct.png
```

#### Extract Data
```bash
curl -X POST http://localhost:3001/api/stego/extract \
  -F "image=@secured.png" \
  -F "password=mypassword" \
  -F "method=lsb"
```

#### GAN-based Embedding (ML)
```bash
curl -X POST http://localhost:5000/api/ml/embed/gan \
  -F "image=@cover.png" \
  -F "data=secret" \
  -o secured-gan.png
```

#### Detect Hidden Data
```bash
curl -X POST http://localhost:5000/api/ml/analyze \
  -F "image=@suspicious.png"
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  • Client-side steganography                            │
│  • AES-256 encryption                                   │
│  • Canvas API image processing                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├─────────────────┬──────────────────────┐
                 │                 │                      │
┌────────────────▼─────┐  ┌────────▼──────┐  ┌──────────▼────────┐
│   Backend API        │  │  ML Service   │  │   Database        │
│   (Node.js)          │  │  (Python)     │  │   (Optional)      │
│                      │  │               │  │                   │
│  • LSB               │  │  • GAN        │  │  • User accounts  │
│  • DCT               │  │  • Deep       │  │  • Logs           │
│  • Spread Spectrum   │  │    Learning   │  │  • Analytics      │
│  • Encryption        │  │  • Detection  │  │                   │
└──────────────────────┘  └───────────────┘  └───────────────────┘
```

## 📊 Capacity Guide

| Image Size | Max Data (LSB) | Recommended |
|------------|----------------|-------------|
| 640x480    | ~115 KB        | ~75 KB      |
| 1280x720   | ~345 KB        | ~230 KB     |
| 1920x1080  | ~777 KB        | ~500 KB     |
| 3840x2160  | ~3.1 MB        | ~2 MB       |

## 🔒 Security Features

- **AES-256-GCM Encryption** - Industry standard
- **PBKDF2 Key Derivation** - 100,000 iterations
- **Password Protection** - Optional layer
- **No Server Storage** - Client-side processing available
- **Auto File Cleanup** - Temporary files deleted
- **Rate Limiting** - Prevent brute force
- **Input Validation** - Prevent injection attacks

## 🎯 Use Cases

- 🔑 **Cryptocurrency Wallets** - Hide private keys
- 📝 **Passwords** - Secure password storage
- 🔐 **Seed Phrases** - Backup recovery phrases
- 📄 **Sensitive Documents** - Hide confidential data
- 🎫 **License Keys** - Embed software licenses
- 🔗 **API Keys** - Secure API credentials

## 📁 Project Structure

```
secure-shadow-main/
├── src/                      # Frontend React app
│   ├── components/           # UI components
│   ├── pages/               # Page components
│   ├── lib/                 # Steganography libraries
│   │   ├── steganography.ts # LSB + encryption
│   │   └── advancedStego.ts # DCT + spread spectrum
│   └── hooks/               # React hooks
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   │   ├── lsb.service.ts
│   │   │   ├── dct.service.ts
│   │   │   ├── spreadSpectrum.service.ts
│   │   │   └── encryption.service.ts
│   │   ├── routes/          # API routes
│   │   └── middleware/      # Express middleware
│   └── package.json
├── ml-service/              # Python ML service
│   ├── services/
│   │   ├── gan_stego.py     # GAN-based
│   │   ├── deep_stego.py    # Deep learning
│   │   └── steganalysis.py  # Detection
│   ├── app.py               # Flask server
│   └── requirements.txt
├── docker-compose.yml       # Docker orchestration
└── IMPLEMENTATION_GUIDE.md  # Detailed guide
```

## 🧪 Testing

### Frontend
```bash
npm run test
```

### Backend
```bash
cd backend
npm run test
```

### ML Service
```bash
cd ml-service
pytest
```

### Integration Tests
```bash
./test-integration.sh
```

## 📈 Performance

| Operation | Time (CPU) | Time (GPU) |
|-----------|-----------|-----------|
| LSB Embed | 1-2s | N/A |
| DCT Embed | 3-5s | N/A |
| GAN Embed | 8-10s | 2-3s |
| Extract | 0.5-1s | 0.2-0.5s |
| Steganalysis | 1-2s | 0.5-1s |

*Based on 1920x1080 PNG image*

## 🐛 Troubleshooting

### "Data too large" error
**Solution:** Use a larger image or compress your data

### "No valid hidden data found"
**Solution:** Ensure image hasn't been compressed (use PNG, not JPEG)

### "Decryption failed"
**Solution:** Verify password is correct

### CORS errors
**Solution:** Check CORS_ORIGIN in backend .env file

### ML service slow
**Solution:** Enable GPU acceleration or reduce image size

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- **Steganography Research** - Academic papers on LSB, DCT, and GAN methods
- **Cryptography** - Web Crypto API and Node.js crypto module
- **UI Design** - Shadcn/ui component library
- **ML Frameworks** - TensorFlow and PyTorch communities

## 📞 Support

- 📧 Email: support@stealthvault.com
- 💬 Discord: [Join our server](https://discord.gg/stealthvault)
- 🐛 Issues: [GitHub Issues](https://github.com/user/repo/issues)
- 📚 Docs: [Full Documentation](https://docs.stealthvault.com)

## 🗺️ Roadmap

### v2.1 (Q2 2024)
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Video steganography
- [ ] Audio steganography

### v2.2 (Q3 2024)
- [ ] Blockchain verification
- [ ] IPFS integration
- [ ] Multi-user collaboration
- [ ] Advanced GAN architectures

### v3.0 (Q4 2024)
- [ ] Desktop app (Electron)
- [ ] Hardware wallet integration
- [ ] Zero-knowledge proofs
- [ ] Quantum-resistant encryption

---

**⚠️ Disclaimer:** This tool is for educational and legitimate security purposes only. Users are responsible for complying with applicable laws and regulations.

**Made with ❤️ by the StealthVault Team**
