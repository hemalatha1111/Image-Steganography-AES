import sharp from 'sharp';

/**
 * DCT-based Steganography Service
 * More robust against JPEG compression
 */
export class DCTSteganography {
  private static readonly BLOCK_SIZE = 8;
  private static readonly HEADER_SIZE = 32;

  /**
   * Embed data using DCT
   */
  static async embed(
    imageBuffer: Buffer,
    data: string,
    strength: number = 10
  ): Promise<Buffer> {
    const image = sharp(imageBuffer);
    const { data: pixels, info } = await image.raw().toBuffer({ resolveWithObject: true });

    const binaryData = this.stringToBinary(data);
    const dataLength = binaryData.length;

    // Embed length header
    const lengthBinary = dataLength.toString(2).padStart(this.HEADER_SIZE, '0');
    let dataIndex = 0;

    // Process image in 8x8 blocks
    const width = info.width;
    const height = info.height;
    const channels = info.channels;

    // Embed header in first blocks
    for (let i = 0; i < this.HEADER_SIZE && dataIndex < this.HEADER_SIZE; i++) {
      const blockX = (i % Math.floor(width / this.BLOCK_SIZE)) * this.BLOCK_SIZE;
      const blockY = Math.floor(i / Math.floor(width / this.BLOCK_SIZE)) * this.BLOCK_SIZE;

      if (blockY + this.BLOCK_SIZE <= height) {
        const block = this.extractBlock(pixels, blockX, blockY, width, channels);
        const dctBlock = this.dct2D(block);

        // Embed bit in mid-frequency coefficient
        const bit = parseInt(lengthBinary[i]);
        dctBlock[2][2] = Math.round(dctBlock[2][2] / strength) * strength + (bit * strength / 2);

        const idctBlock = this.idct2D(dctBlock);
        this.insertBlock(pixels, idctBlock, blockX, blockY, width, channels);
        dataIndex++;
      }
    }

    // Embed actual data
    dataIndex = 0;
    let blockIndex = Math.ceil(this.HEADER_SIZE / (Math.floor(width / this.BLOCK_SIZE)));

    while (dataIndex < binaryData.length) {
      const blockX = (blockIndex % Math.floor(width / this.BLOCK_SIZE)) * this.BLOCK_SIZE;
      const blockY = Math.floor(blockIndex / Math.floor(width / this.BLOCK_SIZE)) * this.BLOCK_SIZE;

      if (blockY + this.BLOCK_SIZE > height) break;

      const block = this.extractBlock(pixels, blockX, blockY, width, channels);
      const dctBlock = this.dct2D(block);

      const bit = parseInt(binaryData[dataIndex]);
      dctBlock[2][2] = Math.round(dctBlock[2][2] / strength) * strength + (bit * strength / 2);

      const idctBlock = this.idct2D(dctBlock);
      this.insertBlock(pixels, idctBlock, blockX, blockY, width, channels);

      dataIndex++;
      blockIndex++;
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
   * Extract data using DCT
   */
  static async extract(imageBuffer: Buffer, strength: number = 10): Promise<string> {
    const image = sharp(imageBuffer);
    const { data: pixels, info } = await image.raw().toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;
    const channels = info.channels;

    // Extract header
    let lengthBinary = '';
    for (let i = 0; i < this.HEADER_SIZE; i++) {
      const blockX = (i % Math.floor(width / this.BLOCK_SIZE)) * this.BLOCK_SIZE;
      const blockY = Math.floor(i / Math.floor(width / this.BLOCK_SIZE)) * this.BLOCK_SIZE;

      if (blockY + this.BLOCK_SIZE <= height) {
        const block = this.extractBlock(pixels, blockX, blockY, width, channels);
        const dctBlock = this.dct2D(block);

        const value = dctBlock[2][2];
        const bit = Math.round((value % strength) / (strength / 2)) % 2;
        lengthBinary += bit.toString();
      }
    }

    const dataLength = parseInt(lengthBinary, 2);
    if (dataLength <= 0 || dataLength > 1000000) {
      throw new Error('No valid hidden data found');
    }

    // Extract data
    let binaryData = '';
    let blockIndex = Math.ceil(this.HEADER_SIZE / (Math.floor(width / this.BLOCK_SIZE)));

    while (binaryData.length < dataLength) {
      const blockX = (blockIndex % Math.floor(width / this.BLOCK_SIZE)) * this.BLOCK_SIZE;
      const blockY = Math.floor(blockIndex / Math.floor(width / this.BLOCK_SIZE)) * this.BLOCK_SIZE;

      if (blockY + this.BLOCK_SIZE > height) break;

      const block = this.extractBlock(pixels, blockX, blockY, width, channels);
      const dctBlock = this.dct2D(block);

      const value = dctBlock[2][2];
      const bit = Math.round((value % strength) / (strength / 2)) % 2;
      binaryData += bit.toString();

      blockIndex++;
    }

    return this.binaryToString(binaryData);
  }

  // ============ DCT HELPER METHODS ============

  private static extractBlock(
    pixels: Buffer,
    x: number,
    y: number,
    width: number,
    channels: number
  ): number[][] {
    const block: number[][] = [];
    for (let i = 0; i < this.BLOCK_SIZE; i++) {
      block[i] = [];
      for (let j = 0; j < this.BLOCK_SIZE; j++) {
        const index = ((y + i) * width + (x + j)) * channels;
        // Convert to grayscale
        block[i][j] = 0.299 * pixels[index] + 0.587 * pixels[index + 1] + 0.114 * pixels[index + 2];
      }
    }
    return block;
  }

  private static insertBlock(
    pixels: Buffer,
    block: number[][],
    x: number,
    y: number,
    width: number,
    channels: number
  ): void {
    for (let i = 0; i < this.BLOCK_SIZE; i++) {
      for (let j = 0; j < this.BLOCK_SIZE; j++) {
        const index = ((y + i) * width + (x + j)) * channels;
        const value = Math.max(0, Math.min(255, Math.round(block[i][j])));

        const oldLum = 0.299 * pixels[index] + 0.587 * pixels[index + 1] + 0.114 * pixels[index + 2];
        const ratio = oldLum > 0 ? value / oldLum : 1;

        pixels[index] = Math.min(255, Math.round(pixels[index] * ratio));
        pixels[index + 1] = Math.min(255, Math.round(pixels[index + 1] * ratio));
        pixels[index + 2] = Math.min(255, Math.round(pixels[index + 2] * ratio));
      }
    }
  }

  private static dct2D(block: number[][]): number[][] {
    const size = block.length;
    const result: number[][] = Array(size)
      .fill(0)
      .map(() => Array(size).fill(0));

    for (let u = 0; u < size; u++) {
      for (let v = 0; v < size; v++) {
        let sum = 0;
        for (let x = 0; x < size; x++) {
          for (let y = 0; y < size; y++) {
            sum +=
              block[x][y] *
              Math.cos(((2 * x + 1) * u * Math.PI) / (2 * size)) *
              Math.cos(((2 * y + 1) * v * Math.PI) / (2 * size));
          }
        }
        const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
        const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
        result[u][v] = (2 / size) * cu * cv * sum;
      }
    }

    return result;
  }

  private static idct2D(block: number[][]): number[][] {
    const size = block.length;
    const result: number[][] = Array(size)
      .fill(0)
      .map(() => Array(size).fill(0));

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        let sum = 0;
        for (let u = 0; u < size; u++) {
          for (let v = 0; v < size; v++) {
            const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
            const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
            sum +=
              cu *
              cv *
              block[u][v] *
              Math.cos(((2 * x + 1) * u * Math.PI) / (2 * size)) *
              Math.cos(((2 * y + 1) * v * Math.PI) / (2 * size));
          }
        }
        result[x][y] = (2 / size) * sum;
      }
    }

    return result;
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
