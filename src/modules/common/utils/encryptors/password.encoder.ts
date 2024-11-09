import bcrypt from 'bcryptjs';

export class PasswordEncoder {
  private static saltRounds = 10;

  static async hashPassword(text: string | number): Promise<string> {
    return await bcrypt.hash(String(text), this.saltRounds);
  }

  static async comparePassword(plainText: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainText, hashedPassword);
  }
}
