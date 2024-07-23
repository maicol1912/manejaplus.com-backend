import { Injectable } from '@nestjs/common';
import { TwilioService } from 'nestjs-twilio';

@Injectable()
export class MessagingService {
  public constructor(private readonly twilioService: TwilioService) {}

  async sendSMS(): Promise<any> {
    try {
      const message = await this.twilioService.client.messages.create({
        body: 'Your Otp code to login in manejaplus.com is 09999',
        from: '+12513552627',
        to: '+573006567975'
      });
      return message;
    } catch (error) {
      console.error('Error al enviar SMS:', error);
      throw error;
    }
  }

  async makeCall(): Promise<any> {
    try {
      const call = await this.twilioService.client.calls.create({
        twiml: '<Response><Say>Ahoy, World! Your otp code is 09999</Say></Response>',
        from: '+12513552627',
        to: '+573006567975'
      });
      console.log(`Llamada iniciada con SID: ${call.sid}`);
      return call;
    } catch (error) {
      console.error('Error al realizar la llamada:', error);
      throw error;
    }
  }
}
