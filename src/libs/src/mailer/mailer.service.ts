import { Injectable } from '@nestjs/common';
import config from 'config';
import path from 'path';
import Email from 'email-templates';
import nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  public async sendEmail(
    receiver: string[] | string,
    template: string,
    locals: any | undefined,
    attachment?: any
  ) {
    try {
      const smtpTransport: nodemailer.Transporter = nodemailer.createTransport({
        host: config.get('MAILER.HOST'),
        port: config.get('MAILER.PORT'),
        auth: {
          user: `${config.get('MAILER.USER')}`,
          pass: `${config.get('MAILER.PASSWORD')}`
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      const email: Email = new Email({
        message: {
          from: `Manejaplus.com <${config.get('MAILER.USER')}>`
        },
        send: true,
        preview: false,
        transport: smtpTransport,
        views: {
          options: {
            extension: 'ejs'
          }
        },
        juice: true,
        juiceResources: {
          preserveImportant: true,
          webResources: {
            relativeTo: path.join(__dirname, '../build')
          }
        }
      });
      return await email.send({
        template: path.join(__dirname, 'emails', template),
        message: {
          to: receiver,
          attachments: attachment
            ? [
                {
                  filename: attachment.filename,
                  content: attachment.file,
                  contentType: 'application/pdf'
                }
              ]
            : []
        },
        locals
      });
    } catch (error) {
      throw error;
    }
  }
}
