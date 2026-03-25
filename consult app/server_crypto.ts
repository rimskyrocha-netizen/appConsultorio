
// Fix: Explicitly import Buffer to resolve 'Cannot find name Buffer' errors in strict TypeScript environments
import { Buffer } from 'buffer';
import crypto from 'crypto';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export class CryptoService {
  private static ALGORITHM = 'aes-256-gcm';
  private static IV_LENGTH = 12;
  private static AUTH_TAG_LENGTH = 16;

  /**
   * Comprime e Criptografa dados
   */
  // Fix: Reference imported Buffer type
  static async encrypt(data: string, masterKey: string): Promise<{ blob: Buffer; checksum: string }> {
    const compressed = await gzip(data);
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const key = crypto.scryptSync(masterKey, 'salt', 32);
    
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    // Fix: Use imported Buffer for concatenation
    const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Estrutura final: IV (12) + AuthTag (16) + Dados Encryptados
    // Fix: Use imported Buffer for concatenation
    const blob = Buffer.concat([iv, authTag, encrypted]);
    const checksum = crypto.createHash('sha256').update(blob).digest('hex');

    return { blob, checksum };
  }

  /**
   * Descriptografa e Descomprime dados
   */
  // Fix: Reference imported Buffer type
  static async decrypt(blob: Buffer, masterKey: string, expectedChecksum: string): Promise<string> {
    const actualChecksum = crypto.createHash('sha256').update(blob).digest('hex');
    if (actualChecksum !== expectedChecksum) {
      throw new Error('Falha na integridade: Checksum não corresponde.');
    }

    const iv = blob.subarray(0, this.IV_LENGTH);
    const authTag = blob.subarray(this.IV_LENGTH, this.IV_LENGTH + this.AUTH_TAG_LENGTH);
    const encryptedData = blob.subarray(this.IV_LENGTH + this.AUTH_TAG_LENGTH);
    
    const key = crypto.scryptSync(masterKey, 'salt', 32);
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Fix: Use imported Buffer for concatenation
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    const decompressed = await gunzip(decrypted);

    return decompressed.toString();
  }
}
