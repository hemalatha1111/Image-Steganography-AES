/**
 * Advanced Steganography Techniques
 * Includes DCT-based and spread spectrum methods
 */

export class AdvancedSteganography {
  /**
   * DCT-based steganography (more robust against compression)
   * Embeds data in frequency domain
   */
  static async embedDCT(
    imageFile: File,
    data: string,
    strength: number = 10
  ): Promise<Blob> {
    const img = await this.loadImage(imageFile);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Convert data to binary
    const binaryData = this.stringToBinary(data);
    
    // Process in 8x8 blocks (DCT standard)
    const blockSize = 8;
    let dataIndex = 0;

    for (let y = 0; y < canvas.height - blockSize; y += blockSize) {
      for (let x = 0; x < canvas.width - blockSize; x += blockSize) {
        if (dataIndex >= binaryData.length) break;

        // Extract 8x8 block
        const block = this.extractBlock(pixels, x, y, blockSize, canvas.width);
        
        // Apply DCT
        const dctBlock = this.dct2D(block);
        
        // Embed bit in mid-frequency coefficient
        if (dataIndex < binaryData.length) {
          const bit = parseInt(binaryData[dataIndex]);
          dctBlock[2][2] = Math.round(dctBlock[2][2] / strength) * strength + (bit * strength / 2);
          dataIndex++;
        }

        // Apply inverse DCT
        const idctBlock = this.idct2D(dctBlock);
        
        // Put block back
        this.insertBlock(pixels, idctBlock, x, y, blockSize, canvas.width);
      }
      if (dataIndex >= binaryData.length) break;
    }

    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });
  }

  /**
   * Spread Spectrum Steganography
   * Spreads data across entire image for better security
   */
  static async embedSpreadSpectrum(
    imageFile: File,
    data: string,
    key: string = 'default'
  ): Promise<Blob> {
    const img = await this.loadImage(imageFile);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    const binaryData = this.stringToBinary(data);
    const positions = this.generatePseudoRandomPositions(
      binaryData.length,
      Math.floor(pixels.length / 4) * 3,
      key
    );

    // Embed each bit at pseudo-random position
    for (let i = 0; i < binaryData.length; i++) {
      const pos = positions[i];
      const pixelIndex = Math.floor(pos / 3) * 4 + (pos % 3);
      const bit = parseInt(binaryData[i]);
      
      pixels[pixelIndex] = (pixels[pixelIndex] & 0xFE) | bit;
    }

    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });
  }

  /**
   * Extract data using spread spectrum
   */
  static async extractSpreadSpectrum(
    imageFile: File,
    dataLength: number,
    key: string = 'default'
  ): Promise<string> {
    const img = await this.loadImage(imageFile);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    const positions = this.generatePseudoRandomPositions(
      dataLength * 8,
      Math.floor(pixels.length / 4) * 3,
      key
    );

    let binaryData = '';
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const pixelIndex = Math.floor(pos / 3) * 4 + (pos % 3);
      binaryData += (pixels[pixelIndex] & 1).toString();
    }

    return this.binaryToString(binaryData);
  }

  // ============ HELPER METHODS ============

  private static extractBlock(
    pixels: Uint8ClampedArray,
    x: number,
    y: number,
    size: number,
    width: number
  ): number[][] {
    const block: number[][] = [];
    for (let i = 0; i < size; i++) {
      block[i] = [];
      for (let j = 0; j < size; j++) {
        const index = ((y + i) * width + (x + j)) * 4;
        // Use luminance (grayscale conversion)
        block[i][j] = 0.299 * pixels[index] + 0.587 * pixels[index + 1] + 0.114 * pixels[index + 2];
      }
    }
    return block;
  }

  private static insertBlock(
    pixels: Uint8ClampedArray,
    block: number[][],
    x: number,
    y: number,
    size: number,
    width: number
  ): void {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const index = ((y + i) * width + (x + j)) * 4;
        const value = Math.max(0, Math.min(255, Math.round(block[i][j])));
        
        // Maintain color ratios
        const oldLum = 0.299 * pixels[index] + 0.587 * pixels[index + 1] + 0.114 * pixels[index + 2];
        const ratio = oldLum > 0 ? value / oldLum : 1;
        
        pixels[index] = Math.min(255, pixels[index] * ratio);
        pixels[index + 1] = Math.min(255, pixels[index + 1] * ratio);
        pixels[index + 2] = Math.min(255, pixels[index + 2] * ratio);
      }
    }
  }

  private static dct2D(block: number[][]): number[][] {
    const size = block.length;
    const result: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));

    for (let u = 0; u < size; u++) {
      for (let v = 0; v < size; v++) {
        let sum = 0;
        for (let x = 0; x < size; x++) {
          for (let y = 0; y < size; y++) {
            sum += block[x][y] *
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
    const result: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        let sum = 0;
        for (let u = 0; u < size; u++) {
          for (let v = 0; v < size; v++) {
            const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
            const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
            sum += cu * cv * block[u][v] *
              Math.cos(((2 * x + 1) * u * Math.PI) / (2 * size)) *
              Math.cos(((2 * y + 1) * v * Math.PI) / (2 * size));
          }
        }
        result[x][y] = (2 / size) * sum;
      }
    }

    return result;
  }

  private static generatePseudoRandomPositions(
    count: number,
    max: number,
    seed: string
  ): number[] {
    // Simple LCG (Linear Congruential Generator) with seed
    const positions: number[] = [];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }

    let current = Math.abs(hash);
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);

    const used = new Set<number>();
    
    while (positions.length < count) {
      current = (a * current + c) % m;
      const pos = current % max;
      
      if (!used.has(pos)) {
        positions.push(pos);
        used.add(pos);
      }
    }

    return positions;
  }

  private static stringToBinary(str: string): string {
    return str
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('');
  }

  private static binaryToString(binary: string): string {
    const bytes = binary.match(/.{8}/g) || [];
    return bytes
      .map(byte => String.fromCharCode(parseInt(byte, 2)))
      .join('');
  }

  private static loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
}
