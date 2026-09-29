import fs from 'fs';
import path from 'path';

/**
 * Cleanup temporary files older than 1 hour
 */
export function cleanupTempFiles(): void {
  const tempDir = path.join(__dirname, '../../temp');

  if (!fs.existsSync(tempDir)) {
    return;
  }

  const now = Date.now();
  const maxAge = 3600000; // 1 hour in milliseconds

  fs.readdir(tempDir, (err, files) => {
    if (err) {
      console.error('Error reading temp directory:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(tempDir, file);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }

        if (now - stats.mtimeMs > maxAge) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log('Deleted old temp file:', file);
            }
          });
        }
      });
    });
  });
}
