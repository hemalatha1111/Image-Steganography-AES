import { Request, Response, NextFunction } from 'express';
import { LSBSteganography } from '../services/lsb.service';
import { DCTSteganography } from '../services/dct.service';
import { SpreadSpectrumStego } from '../services/spreadSpectrum.service';
import { EncryptionService } from '../services/encryption.service';
import sharp from 'sharp';

export class StegoController {
  /**
   * Embed data into image using LSB
   */
  async embedData(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const { data, password, method = 'lsb' } = req.body;

      if (!data) {
        return res.status(400).json({ error: 'No data provided to embed' });
      }

      // Encrypt data if password provided
      let dataToEmbed = data;
      if (password) {
        dataToEmbed = await EncryptionService.encrypt(data, password);
      }

      let resultBuffer: Buffer;

      switch (method) {
        case 'lsb':
          resultBuffer = await LSBSteganography.embed(req.file.buffer, dataToEmbed);
          break;
        case 'dct':
          resultBuffer = await DCTSteganography.embed(req.file.buffer, dataToEmbed);
          break;
        case 'spread':
          const key = req.body.key || 'default';
          resultBuffer = await SpreadSpectrumStego.embed(req.file.buffer, dataToEmbed, key);
          break;
        default:
          return res.status(400).json({ error: 'Invalid method' });
      }

      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="secured-image.png"',
      });

      res.send(resultBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Extract data from image
   */
  async extractData(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const { password, method = 'lsb' } = req.body;

      let extractedData: string;

      switch (method) {
        case 'lsb':
          extractedData = await LSBSteganography.extract(req.file.buffer);
          break;
        case 'dct':
          extractedData = await DCTSteganography.extract(req.file.buffer);
          break;
        case 'spread':
          const key = req.body.key || 'default';
          const dataLength = parseInt(req.body.dataLength);
          if (!dataLength) {
            return res.status(400).json({ error: 'dataLength required for spread spectrum' });
          }
          extractedData = await SpreadSpectrumStego.extract(req.file.buffer, dataLength, key);
          break;
        default:
          return res.status(400).json({ error: 'Invalid method' });
      }

      // Decrypt if password provided
      if (password) {
        try {
          extractedData = await EncryptionService.decrypt(extractedData, password);
        } catch (error) {
          return res.status(401).json({ error: 'Incorrect password or corrupted data' });
        }
      }

      res.json({
        success: true,
        data: extractedData,
        length: extractedData.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get image capacity
   */
  async getCapacity(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const metadata = await sharp(req.file.buffer).metadata();
      const capacity = LSBSteganography.calculateCapacity(
        metadata.width!,
        metadata.height!
      );

      res.json({
        success: true,
        capacity: {
          maxBytes: capacity.maxBytes,
          maxCharacters: capacity.maxCharacters,
          imageSize: {
            width: metadata.width,
            height: metadata.height,
          },
          format: metadata.format,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DCT-based embedding
   */
  async embedDCT(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const { data, password, strength = 10 } = req.body;

      if (!data) {
        return res.status(400).json({ error: 'No data provided to embed' });
      }

      let dataToEmbed = data;
      if (password) {
        dataToEmbed = await EncryptionService.encrypt(data, password);
      }

      const resultBuffer = await DCTSteganography.embed(
        req.file.buffer,
        dataToEmbed,
        parseInt(strength)
      );

      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="secured-image-dct.png"',
      });

      res.send(resultBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Spread spectrum embedding
   */
  async embedSpreadSpectrum(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const { data, password, key = 'default' } = req.body;

      if (!data) {
        return res.status(400).json({ error: 'No data provided to embed' });
      }

      let dataToEmbed = data;
      if (password) {
        dataToEmbed = await EncryptionService.encrypt(data, password);
      }

      const resultBuffer = await SpreadSpectrumStego.embed(
        req.file.buffer,
        dataToEmbed,
        key
      );

      res.json({
        success: true,
        message: 'Data embedded successfully',
        dataLength: dataToEmbed.length,
        key: key,
      });

      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="secured-image-spread.png"',
      });

      res.send(resultBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Extract with spread spectrum
   */
  async extractSpreadSpectrum(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const { password, key = 'default', dataLength } = req.body;

      if (!dataLength) {
        return res.status(400).json({ error: 'dataLength is required' });
      }

      let extractedData = await SpreadSpectrumStego.extract(
        req.file.buffer,
        parseInt(dataLength),
        key
      );

      if (password) {
        try {
          extractedData = await EncryptionService.decrypt(extractedData, password);
        } catch (error) {
          return res.status(401).json({ error: 'Incorrect password or corrupted data' });
        }
      }

      res.json({
        success: true,
        data: extractedData,
        length: extractedData.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Batch embed multiple images
   */
  async batchEmbed(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No image files provided' });
      }

      const { data, password } = req.body;

      if (!data) {
        return res.status(400).json({ error: 'No data provided to embed' });
      }

      // Split data across images
      const dataChunks = this.splitData(data, files.length);
      const results = [];

      for (let i = 0; i < files.length; i++) {
        let chunkData = dataChunks[i];
        
        if (password) {
          chunkData = await EncryptionService.encrypt(chunkData, password);
        }

        const resultBuffer = await LSBSteganography.embed(files[i].buffer, chunkData);
        
        results.push({
          index: i,
          originalName: files[i].originalname,
          size: resultBuffer.length,
          dataLength: chunkData.length,
        });
      }

      res.json({
        success: true,
        message: 'Batch embedding completed',
        results,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Split data into chunks for batch processing
   */
  private splitData(data: string, chunks: number): string[] {
    const chunkSize = Math.ceil(data.length / chunks);
    const result: string[] = [];

    for (let i = 0; i < chunks; i++) {
      result.push(data.slice(i * chunkSize, (i + 1) * chunkSize));
    }

    return result;
  }
}
