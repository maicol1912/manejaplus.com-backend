import * as bcrypt from 'bcryptjs';

class BcrypEncoder {
  public static async passwordEncoder(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(10);

      const hashedPassword = await bcrypt.hash(password, salt);

      return hashedPassword;
    } catch (error) {
      throw new Error('Error al encriptar la contraseña');
    }
  }

  public static async checkPasswordAreEquals(
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

export { BcrypEncoder };
