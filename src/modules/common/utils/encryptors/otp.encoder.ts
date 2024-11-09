import { randomBytes } from 'crypto';

export function generateRandomOtp(): string {
   const buffer = randomBytes(8);
    
   let numericValue = parseInt(buffer.toString('hex'), 16);
   
   numericValue = numericValue % 900000 + 100000;
   
   let otpString = numericValue.toString();
   
   
   return otpString;
}
