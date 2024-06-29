import { v4 as uuidv4 } from 'uuid';

function UUIDEncoder(): string {
  try {
    const uuid = uuidv4();
    return uuid;
  } catch (error) {
    throw new Error('Error al generar el UUID');
  }
}

export { UUIDEncoder };
