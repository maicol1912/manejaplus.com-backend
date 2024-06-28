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

export { PasswordEncoder };
