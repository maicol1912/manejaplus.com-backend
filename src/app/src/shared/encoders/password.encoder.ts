import * as bcrypt from 'bcryptjs';

async function PasswordEncoder(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  } catch (error) {
    throw new Error('Error al encriptar la contraseña');
  }
}

async function CheckPasswordAreEquals(
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
export { PasswordEncoder, CheckPasswordAreEquals };
