import sharp from 'sharp';

/**
 * LSB (Least Significant Bit) Steganography Service
 */
export class LSBSteganography {
  private static readonly HEADER_SIZE = 32; // 32 bits for data length

  /**
   * Embed data into image using LSB
   */
  static async embed(imageBuffer: Buffer, data: string): Promise<Buffer> {
    // Convert to raw pixel data
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const { data: pixels, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const binaryData = this.stringToBinary(data);
    const dataLength = binaryData.length;

    // Check capacity
    const maxCapacity = this.calculateCapacity(info.width, info.height).maxBits;
    if (dataLength > maxCapacity) {
      throw new Error(
        `Data too large. Max capacity: ${maxCapacity} bits, Data size: ${dataLength} bits`
      );
    }

    // Embed data length in header
    const lengthBinary = dataLength.toString(2).padStart(this.HEADER_SIZE, '0');
    this.embedBits(pixels, lengthBinary, 0);

    // Embed actual data
    this.embedBits(pixels, binaryData, this.HEADER_SIZE);

    // Convert back to PNG
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
   * Extract data from image using LSB
   */
  static async extract(imageBuffer: Buffer): Promise<string> {
    const image = sharp(imageBuffer);
    const { data: pixels, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Extract data length from header
    const lengthBinary = this.extractBits(pixels, 0, this.HEADER_SIZE);
    const dataLength = parseInt(lengthBinary, 2);

    if (dataLength <= 0 || dataLength > this.calculateCapacity(info.width, info.height).maxBits) {
      throw new Error('No valid hidden data found in this image');
    }

    // Extract actual data
    const dataBinary = this.extractBits(pixels, this.HEADER_SIZE, dataLength);
    return this.binaryToString(dataBinary);
  }

  /**
   * Calculate maximum data capacity
   */
  static calculateCapacity(width: number, height: number): {
    maxBits: number;
    maxBytes: number;
    maxCharacters: number;
  } {
    const totalPixels = width * height;
    const usableChannels = totalPixels * 3; // RGB only, skip alpha
    const maxBits = usableChannels - this.HEADER_SIZE;
    const maxBytes = Math.floor(maxBits / 8);

    return {
      maxBits,
      maxBytes,
      maxCharacters: maxBytes,
    };
  }

  // ============ PRIVATE HELPER METHODS ============

  private static embedBits(pixels: Buffer, bits: string, startBit: number): void {
    let bitIndex = 0;
    let pixelIndex = Math.floor(startBit / 3) * 4;

    while (bitIndex < bits.length && pixelIndex < pixels.length) {
      const channelOffset = (startBit + bitIndex) % 3;
      const currentPixelIndex = pixelIndex + channelOffset;

      const bit = parseInt(bits[bitIndex]);
      pixels[currentPixelIndex] = (pixels[currentPixelIndex] & 0xfe) | bit;

      bitIndex++;

      if (channelOffset === 2) {
        pixelIndex += 4;
      }
    }
  }

  private static extractBits(pixels: Buffer, startBit: number, length: number): string {
    let bits = '';
    let bitIndex = 0;
    let pixelIndex = Math.floor(startBit / 3) * 4;

    while (bitIndex < length && pixelIndex < pixels.length) {
      const channelOffset = (startBit + bitIndex) % 3;
      const currentPixelIndex = pixelIndex + channelOffset;

      bits += (pixels[currentPixelIndex] & 1).toString();

      bitIndex++;

      if (channelOffset === 2) {
        pixelIndex += 4;
      }
    }

    return bits;
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
