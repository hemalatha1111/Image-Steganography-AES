import crypto from 'crypto';

/**
 * Encryption Service using AES-256-GCM
 */
export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly SALT_LENGTH = 64;
  private static readonly TAG_LENGTH = 16;
  private static readonly ITERATIONS = 100000;

  /**
   * Encrypt data with password
   */
  static async encrypt(data: string, password: string): Promise<string> {
    // Generate salt
    const salt = crypto.randomBytes(this.SALT_LENGTH);

    // Derive key from password
    const key = crypto.pbkdf2Sync(
      password,
      salt,
      this.ITERATIONS,
      this.KEY_LENGTH,
      'sha256'
    );

    // Generate IV
    const iv = crypto.randomBytes(this.IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

    // Encrypt data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get auth tag
    const authTag = cipher.getAuthTag();

    // Combine: salt + iv + authTag + encrypted data
    const combined = Buffer.concat([
      salt,
      iv,
      authTag,
      Buffer.from(encrypted, 'hex'),
    ]);

    // Return as base64
    return combined.toString('base64');
  }

  /**
   * Decrypt data with password
   */
  static async decrypt(encryptedData: string, password: string): Promise<string> {
    try {
      // Decode from base64
      const combined = Buffer.from(encryptedData, 'base64');

      // Extract components
      const salt = combined.slice(0, this.SALT_LENGTH);
      const iv = combined.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
      const authTag = combined.slice(
        this.SALT_LENGTH + this.IV_LENGTH,
        this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH
      );
      const encrypted = combined.slice(this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH);

      // Derive key from password
      const key = crypto.pbkdf2Sync(
        password,
        salt,
        this.ITERATIONS,
        this.KEY_LENGTH,
        'sha256'
      );

      // Create decipher
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      // Decrypt data
      let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed. Incorrect password or corrupted data.');
    }
  }

  /**
   * Generate a secure random key
   */
  static generateKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash data using SHA-256
   */
  static hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
