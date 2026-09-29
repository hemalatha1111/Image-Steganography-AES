import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Multer errors
  if (err.message.includes('File too large')) {
    return res.status(413).json({
      error: 'File too large',
      message: 'The uploaded file exceeds the maximum allowed size',
    });
  }

  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: err.message,
    });
  }

  // Steganography errors
  if (err.message.includes('Data too large')) {
    return res.status(400).json({
      error: 'Data too large',
      message: err.message,
    });
  }

  if (err.message.includes('No valid hidden data')) {
    return res.status(404).json({
      error: 'No data found',
      message: 'No hidden data was found in the provided image',
    });
  }

  // Encryption errors
  if (err.message.includes('Decryption failed')) {
    return res.status(401).json({
      error: 'Decryption failed',
      message: 'Incorrect password or corrupted data',
    });
  }

  // Generic error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
}
