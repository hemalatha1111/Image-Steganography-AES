import { Router } from 'express';
import multer from 'multer';
import { StegoController } from '../controllers/stego.controller';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPEG, and BMP are allowed.'));
    }
  },
});

const controller = new StegoController();

// Embed data into image
router.post('/embed', upload.single('image'), controller.embedData);

// Extract data from image
router.post('/extract', upload.single('image'), controller.extractData);

// Get image capacity
router.post('/capacity', upload.single('image'), controller.getCapacity);

// Advanced: DCT-based embedding
router.post('/embed/dct', upload.single('image'), controller.embedDCT);

// Advanced: Spread spectrum embedding
router.post('/embed/spread-spectrum', upload.single('image'), controller.embedSpreadSpectrum);

// Extract with spread spectrum
router.post('/extract/spread-spectrum', upload.single('image'), controller.extractSpreadSpectrum);

// Batch processing
router.post('/batch/embed', upload.array('images', 10), controller.batchEmbed);

export default router;
