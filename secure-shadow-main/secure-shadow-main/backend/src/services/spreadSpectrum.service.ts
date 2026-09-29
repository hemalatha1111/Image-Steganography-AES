import sharp from 'sharp';
import crypto from 'crypto';

/**
 * Spread Spectrum Steganography Service
 * Distributes data across image using pseudo-random positions
 */
export class SpreadSpectrumStego {
  /**
   * Embed data using spread spectrum
   */
  static async embed(imageBuffer: Buffer, data: string, key: string): Promise<Buffer> {
    const image = sharp(imageBuffer);
    const { data: pixels, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const binaryData = this.stringToBinary(data);
    const totalPixels = info.width * info.height;
    const usablePositions = totalPixels * 3; // RGB channels

    if (binaryData.length > usablePositions) {
      throw new Error('Data too large for this image');
    }

    // Generate pseudo-random positions based on key
    const positions = this.generatePositions(binaryData.length, usablePositions, key);

    // Embed each bit at pseudo-random position
    for (let i = 0; i < binaryData.length; i++) {
      const pos = positions[i];
      const pixelIndex = Math.floor(pos / 3) * 4 + (pos % 3);
      const bit = parseInt(binaryData[i]);

      pixels[pixelIndex] = (pixels[pixelIndex] & 0xfe) | bit;
    }

    return sharp(pixels, {
      raw: {
        width: info.width,
        height: info.height,
        channels: info.channels as 3 | 4,
      },
    })
      .png()
      .toBuffer();
  }

  /**
   * Extract data using spread spectrum
   */
  static async extract(imageBuffer: Buffer, dataLength: number, key: string): Promise<string> {
    const image = sharp(imageBuffer);
    const { data: pixels, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const totalPixels = info.width * info.height;
    const usablePositions = totalPixels * 3;
    const bitsToExtract = dataLength * 8;

    // Generate same pseudo-random positions
    const positions = this.generatePositions(bitsToExtract, usablePositions, key);

    let binaryData = '';
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const pixelIndex = Math.floor(pos / 3) * 4 + (pos % 3);
      binaryData += (pixels[pixelIndex] & 1).toString();
    }

    return this.binaryToString(binaryData);
  }

  // ============ HELPER METHODS ============

  /**
   * Generate pseudo-random positions using cryptographic hash
   */
  private static generatePositions(count: number, max: number, seed: string): number[] {
    const positions: number[] = [];
    const used = new Set<number>();

    let counter = 0;
    while (positions.length < count && counter < max * 2) {
      const hash = crypto
        .createHash('sha256')
        .update(seed + counter.toString())
        .digest();

      // Use first 4 bytes as position
      const pos = hash.readUInt32BE(0) % max;

      if (!used.has(pos)) {
        positions.push(pos);
        used.add(pos);
      }

      counter++;
    }

    if (positions.length < count) {
      throw new Error('Could not generate enough unique positions');
    }

    return positions;
  }

  private static stringToBinary(str: string): string {
    return str
      .split('')
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('');
  }

  private static binaryToString(binary: string): string {
    const bytes = binary.match(/.{8}/g) || [];
    return bytes.map((byte) => String.fromCharCode(parseInt(byte, 2))).join('');
  }
}
