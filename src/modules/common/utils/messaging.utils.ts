export class MessagingUtils {
  public static generateCode(): string {
    const number = Math.floor(Math.random() * 1000000);
    return number.toString().padStart(6, '0');
  }
}
