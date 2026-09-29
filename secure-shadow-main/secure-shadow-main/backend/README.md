# StealthVault Backend API

Advanced steganography backend with multiple embedding algorithms and encryption.

## Features

- **LSB Steganography**: Basic least significant bit embedding
- **DCT-based Steganography**: Robust against JPEG compression
- **Spread Spectrum**: Pseudo-random distribution for enhanced security
- **AES-256-GCM Encryption**: Password-protected data embedding
- **Batch Processing**: Split data across multiple images
- **Rate Limiting**: Protection against abuse
- **File Validation**: Secure file upload handling

## Installation

```bash
cd backend
npm install
```

## Configuration

Create a `.env` file:

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### POST /api/stego/embed
Embed data into image using LSB

**Request:**
- `image`: Image file (multipart/form-data)
- `data`: Data to embed (string)
- `password`: Optional encryption password
- `method`: 'lsb' | 'dct' | 'spread'

**Response:**
- PNG image with embedded data

### POST /api/stego/extract
Extract data from image

**Request:**
- `image`: Image file with hidden data
- `password`: Optional decryption password
- `method`: 'lsb' | 'dct' | 'spread'

**Response:**
```json
{
  "success": true,
  "data": "extracted data",
  "length": 123
}
```

### POST /api/stego/capacity
Get image capacity

**Request:**
- `image`: Image file

**Response:**
```json
{
  "success": true,
  "capacity": {
    "maxBytes": 1000000,
    "maxCharacters": 1000000,
    "imageSize": { "width": 1920, "height": 1080 },
    "format": "png"
  }
}
```

### POST /api/stego/embed/dct
DCT-based embedding (more robust)

**Request:**
- `image`: Image file
- `data`: Data to embed
- `password`: Optional password
- `strength`: Embedding strength (default: 10)

### POST /api/stego/embed/spread-spectrum
Spread spectrum embedding (more secure)

**Request:**
- `image`: Image file
- `data`: Data to embed
- `password`: Optional password
- `key`: Pseudo-random key (default: 'default')

### POST /api/stego/batch/embed
Batch embed across multiple images

**Request:**
- `images`: Multiple image files
- `data`: Data to split and embed
- `password`: Optional password

## Security Features

- Rate limiting (100 requests per 15 minutes)
- File size limits (10MB default)
- File type validation (PNG, JPEG, BMP only)
- Helmet.js security headers
- CORS protection
- No data logging
- Automatic temp file cleanup

## Architecture

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   │   ├── lsb.service.ts
│   │   ├── dct.service.ts
│   │   ├── spreadSpectrum.service.ts
│   │   └── encryption.service.ts
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── utils/           # Helper functions
│   └── server.ts        # Entry point
├── dist/                # Compiled JavaScript
└── temp/                # Temporary files (auto-cleanup)
```

## Performance

- LSB: ~1-2 seconds for 1920x1080 image
- DCT: ~3-5 seconds for 1920x1080 image
- Spread Spectrum: ~2-3 seconds for 1920x1080 image

## Capacity

For a 1920x1080 PNG image:
- Max capacity: ~777 KB of data
- Recommended: <500 KB for best quality

## Error Handling

All errors return JSON:
```json
{
  "error": "Error type",
  "message": "Detailed message"
}
```

Common status codes:
- 400: Bad request (invalid data, file too large)
- 401: Unauthorized (wrong password)
- 404: Not found (no hidden data)
- 413: Payload too large
- 429: Too many requests
- 500: Internal server error

## Testing

```bash
# Test embed
curl -X POST http://localhost:3001/api/stego/embed \
  -F "image=@test.png" \
  -F "data=secret message" \
  -F "password=mypassword" \
  -o secured.png

# Test extract
curl -X POST http://localhost:3001/api/stego/extract \
  -F "image=@secured.png" \
  -F "password=mypassword"
```

## Deployment

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

### Environment Variables (Production)
- Set `NODE_ENV=production`
- Use strong secrets
- Configure proper CORS origins
- Set appropriate rate limits
- Use HTTPS only

## License

MIT
