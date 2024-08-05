import CryptoJS from 'crypto-js';
import config from 'config';
import * as bcrypt from 'bcryptjs';

class EncryptionUtil {
  private static key: string = config.get<string>('KEY_ENCODER_CRYPTO');

  private static encryptValue(value: any): any {
    if (typeof value === 'function') {
      return value;
    }
    const stringValue = JSON.stringify(value);
    return CryptoJS.AES.encrypt(stringValue, this.key).toString();
  }

  private static decryptValue(encryptedValue: any): any {
    if (typeof encryptedValue === 'function') {
      return encryptedValue;
    }
    if (typeof encryptedValue !== 'string') {
      return encryptedValue;
    }
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedValue, this.key);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      return encryptedValue;
    }
  }

  public static encryptString(str: string): string {
    return CryptoJS.AES.encrypt(str, this.key).toString();
  }

  public static decryptString(encryptedStr: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedStr, this.key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  public static encryptObject(obj: object): object {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        result[key] = this.encryptObject(value);
      } else {
        result[key] = this.encryptValue(value);
      }
    }
    return result;
  }

  public static decryptObject(encryptedObj: object): object {
    const result: any = {};
    for (const [key, value] of Object.entries(encryptedObj)) {
      if (typeof value === 'object' && value !== null) {
        result[key] = this.decryptObject(value);
      } else {
        result[key] = this.decryptValue(value);
      }
    }
    return result;
  }

  public static encryptObjectAsString(obj: object): string {
    return this.encryptValue(obj);
  }

  public static decryptObjectFromString(encryptedString: string): object {
    return this.decryptValue(encryptedString);
  }

  public static encryptArray(arr: any[]): string[] {
    return arr.map((item) => {
      if (typeof item === 'object' && item !== null) {
        return this.encryptObjectAsString(item);
      } else {
        return this.encryptValue(item);
      }
    });
  }

  public static decryptArray(encryptedArr: string[]): any[] {
    return encryptedArr.map((item) => this.decryptValue(item));
  }

  public static encryptArrayAsString(arr: any[]): string {
    return this.encryptValue(arr);
  }

  public static decryptArrayFromString(encryptedString: string): any[] {
    const decrypted = this.decryptValue(encryptedString);
    if (!Array.isArray(decrypted)) {
      return [];
    }
    return decrypted;
  }

  public static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(10);

      const hashedPassword = await bcrypt.hash(password, salt);

      return hashedPassword;
    } catch (error) {
      throw new Error('Error al encriptar la contraseña');
    }
  }

  public static async comparePasswords(
    passwordTry: string,
    originalPassword: string
  ): Promise<boolean> {
    try {
      const areEqual = await bcrypt.compare(passwordTry, originalPassword);
      return areEqual;
    } catch (error) {
      return false;
    }
  }
}

export { EncryptionUtil };
