/**
 * LSB (Least Significant Bit) Steganography Implementation
 * Embeds data into the least significant bits of image pixels
 */

export class Steganography {
  private static readonly HEADER_SIZE = 32; // 32 bits for data length
  private static readonly BITS_PER_CHANNEL = 1; // Use 1 LSB per color channel

  /**
   * Embed data into an image using LSB steganography
   */
  static async embedData(
    imageFile: File,
    data: string,
    password?: string
  ): Promise<Blob> {
    // Load image
    const img = await this.loadImage(imageFile);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Prepare data for embedding
    const dataToEmbed = password 
      ? await this.encryptData(data, password)
      : data;
    
    const binaryData = this.stringToBinary(dataToEmbed);
    const dataLength = binaryData.length;

    // Check capacity
    const maxCapacity = this.calculateCapacity(pixels.length);
    if (dataLength > maxCapacity) {
      throw new Error(
        `Data too large. Max capacity: ${maxCapacity} bits, Data size: ${dataLength} bits`
      );
    }

    // Embed data length in header (first 32 bits)
    const lengthBinary = dataLength.toString(2).padStart(this.HEADER_SIZE, '0');
    this.embedBits(pixels, lengthBinary, 0);

    // Embed actual data
    this.embedBits(pixels, binaryData, this.HEADER_SIZE);

    // Put modified pixels back
    ctx.putImageData(imageData, 0, 0);

    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });
  }

  /**
   * Extract data from an image using LSB steganography
   */
  static async extractData(
    imageFile: File,
    password?: string
  ): Promise<string> {
    // Load image
    const img = await this.loadImage(imageFile);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Extract data length from header
    const lengthBinary = this.extractBits(pixels, 0, this.HEADER_SIZE);
    const dataLength = parseInt(lengthBinary, 2);

    if (dataLength <= 0 || dataLength > this.calculateCapacity(pixels.length)) {
      throw new Error('No valid hidden data found in this image');
    }

    // Extract actual data
    const dataBinary = this.extractBits(pixels, this.HEADER_SIZE, dataLength);
    const extractedData = this.binaryToString(dataBinary);

    // Decrypt if password provided
    if (password) {
      return await this.decryptData(extractedData, password);
    }

    return extractedData;
  }

  /**
   * Calculate maximum data capacity in bits
   */
  static calculateCapacity(pixelDataLength: number): number {
    // Each pixel has 4 values (RGBA), we use 3 (RGB) for embedding
    // Skip alpha channel to maintain image quality
    const usableChannels = Math.floor(pixelDataLength / 4) * 3;
    return usableChannels * this.BITS_PER_CHANNEL - this.HEADER_SIZE;
  }

  /**
   * Calculate capacity for a file
   */
  static async getImageCapacity(imageFile: File): Promise<{
    maxBytes: number;
    maxCharacters: number;
    imageSize: { width: number; height: number };
  }> {
    const img = await this.loadImage(imageFile);
    const totalPixels = img.width * img.height;
    const maxBits = this.calculateCapacity(totalPixels * 4);
    const maxBytes = Math.floor(maxBits / 8);
    
    return {
      maxBytes,
      maxCharacters: maxBytes,
      imageSize: { width: img.width, height: img.height }
    };
  }

  // ============ PRIVATE HELPER METHODS ============

  private static embedBits(pixels: Uint8ClampedArray, bits: string, startBit: number): void {
    let bitIndex = 0;
    let pixelIndex = Math.floor(startBit / 3) * 4; // Start at correct pixel (skip alpha)

    while (bitIndex < bits.length && pixelIndex < pixels.length) {
      const channelOffset = (startBit + bitIndex) % 3; // RGB only (0, 1, 2)
      const currentPixelIndex = pixelIndex + channelOffset;

      // Modify LSB
      const bit = parseInt(bits[bitIndex]);
      pixels[currentPixelIndex] = (pixels[currentPixelIndex] & 0xFE) | bit;

      bitIndex++;
      
      // Move to next pixel after processing RGB
      if (channelOffset === 2) {
        pixelIndex += 4; // Skip to next pixel (RGBA)
      }
    }
  }

  private static extractBits(pixels: Uint8ClampedArray, startBit: number, length: number): string {
    let bits = '';
    let bitIndex = 0;
    let pixelIndex = Math.floor(startBit / 3) * 4;

    while (bitIndex < length && pixelIndex < pixels.length) {
      const channelOffset = (startBit + bitIndex) % 3;
      const currentPixelIndex = pixelIndex + channelOffset;

      // Extract LSB
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

  // ============ ENCRYPTION METHODS ============

  private static async encryptData(data: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      dataBuffer
    );

    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  }

  private static async decryptData(encryptedData: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);

    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    try {
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
      );

      return decoder.decode(decryptedData);
    } catch (error) {
      throw new Error('Decryption failed. Incorrect password or corrupted data.');
    }
  }
}
