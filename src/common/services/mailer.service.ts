import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../db/prisma.service';

type MessageBuilderResponse = {
  messageTopic: string;
  messageBodyHtml: string;
  messageBodyText: string;
};

enum LangTypes {
  en = 'en',
  pl = 'pl',
}
@Injectable()
export class MailService {
  constructor(private readonly prismaService: PrismaService) {}

  //send testing mail
  async testMailer(
    email: string,
  ): Promise<{ status: boolean; err?: string | undefined }> {
    try {
      if (
        !process.env.MAILER_CLIENT_USERNAME ||
        !process.env.MAILER_CLIENT_PASSWORD ||
        !process.env.MAILER_CLIENT_HOST ||
        !process.env.MAILER_CLIENT_PORT
      ) {
        Logger.error(
          'Missing one of variable in .env file: MAILER_CLIENT_USERNAME | MAILER_CLIENT_PASSWORD | MAILER_CLIENT_HOST | MAILER_CLIENT_PORT',
          MailService.name,
        );
        return {
          status: false,
          err: 'Missing one of variable in .env file: MAILER_CLIENT_USERNAME | MAILER_CLIENT_PASSWORD | MAILER_CLIENT_HOST | MAILER_CLIENT_PORT',
        };
      }
      if (!email) {
        Logger.error('Missing email', MailService.name);
        return { status: false, err: 'Missing email' };
      }

      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        host: process.env.MAILER_CLIENT_HOST,
        port: +process.env.MAILER_CLIENT_PORT,
        secure: +process.env.MAILER_CLIENT_PORT === 465 ? true : false, // true for 465, false for other ports
        auth: {
          user: process.env.MAILER_CLIENT_USERNAME || '',
          pass: process.env.MAILER_CLIENT_PASSWORD || '',
        },
      });

      // send mail with defined transport object
      const { err } = await transporter.sendMail({
        from: process.env.MAILER_CLIENT_USERNAME || '',
        to: email, // list of receivers
        subject: 'Test Mailer',
        text: 'Test Mailer',
        html: '<p>Test Mailer,</p></br></br>',
      });

      if (err) {
        Logger.error(`"TestMailer error: ${err}`, MailService.name);
        return { status: false, err: err };
      }

      return { status: true };
    } catch (error) {
      Logger.error(error);
      return { status: false, err: error.message };
    }
  }

  async sendActivationToken(
    email: string,
    firstName: string,
    token: string,
  ): Promise<boolean> {
    try {
      if (
        !process.env.MAILER_CLIENT_USERNAME ||
        !process.env.MAILER_CLIENT_PASSWORD ||
        !process.env.MAILER_CLIENT_HOST ||
        !process.env.MAILER_CLIENT_PORT
      ) {
        Logger.error(
          'Missing one of variable in .env file: MAILER_CLIENT_USERNAME | MAILER_CLIENT_PASSWORD | MAILER_CLIENT_HOST | MAILER_CLIENT_PORT',
          MailService.name,
        );
        return false;
      }

      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        host: process.env.MAILER_CLIENT_HOST,
        port: +process.env.MAILER_CLIENT_PORT,
        secure: +process.env.MAILER_CLIENT_PORT === 465 ? true : false, // true for 465, false for other ports
        auth: {
          user: process.env.MAILER_CLIENT_USERNAME || '',
          pass: process.env.MAILER_CLIENT_PASSWORD || '',
        },
      });

      const URLToken = `${process.env.FRONT_APP_URL}/auth/activateAccount?token=${token}`;

      const messageData = this.makeActivateAccountEmailMessage(
        firstName,
        URLToken,
      );

      // send mail with defined transport object
      const { err } = await transporter.sendMail({
        from: process.env.MAILER_CLIENT_USERNAME || '',
        to: email, // list of receivers
        subject: messageData.messageTopic,
        text: messageData.messageBodyText,
        html: messageData.messageBodyHtml,
      });

      if (err) {
        Logger.error(
          `"sendActivationToken" function error: ${err}`,
          MailService.name,
        );
        return false;
      }

      return true;
    } catch (err) {
      Logger.error(`ERROR - sendActivationToken: ${err}`, MailService.name);
      return false;
    }
  }

  async sendForgotPasswordToken(
    email: string,
    firstName: string,
    token: string,
    lang: LangTypes = LangTypes.en,
  ): Promise<boolean> {
    try {
      if (
        !process.env.MAILER_CLIENT_USERNAME ||
        !process.env.MAILER_CLIENT_PASSWORD ||
        !process.env.MAILER_CLIENT_HOST ||
        !process.env.MAILER_CLIENT_PORT
      ) {
        Logger.error(
          'Missing one of variable in .env file: MAILER_CLIENT_USERNAME | MAILER_CLIENT_PASSWORD | MAILER_CLIENT_HOST | MAILER_CLIENT_PORT',
          MailService.name,
        );
        return false;
      }

      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        host: process.env.MAILER_CLIENT_HOST,
        port: +process.env.MAILER_CLIENT_PORT,
        secure: +process.env.MAILER_CLIENT_PORT === 465 ? true : false, // true for 465, false for other ports
        auth: {
          user: process.env.MAILER_CLIENT_USERNAME || '',
          pass: process.env.MAILER_CLIENT_PASSWORD || '',
        },
      });

      const URLToken = `${process.env.FRONT_APP_URL}/auth/activateAccount?token=${token}`;

      const messageData = this.makeForgotPasswordEmailMessage(
        firstName,
        URLToken,
        lang,
      );

      // send mail with defined transport object
      const { err } = await transporter.sendMail({
        from: process.env.MAILER_CLIENT_USERNAME || '',
        to: email, // list of receivers
        subject: messageData.messageTopic,
        text: messageData.messageBodyText,
        html: messageData.messageBodyHtml,
      });

      if (err) {
        Logger.error(
          `"sendForgotPasswordToken" function error: ${err}`,
          MailService.name,
        );
        return false;
      }

      return true;
    } catch (err) {
      Logger.error(`ERROR - sendForgotPasswordToken: ${err}`, MailService.name);
      return false;
    }
  }

  //######------------------ PRIVATE ------------------######//

  private makeForgotPasswordEmailMessage(
    firstName: string,
    URLtoken: string,
    lang = LangTypes.en,
  ): MessageBuilderResponse {
    lang;
    const resp: MessageBuilderResponse = {
      messageTopic: ``,
      messageBodyHtml: ``,
      messageBodyText: ``,
    };
    resp.messageTopic = `Forgot password`;
    resp.messageBodyHtml = `<p>Hello ${firstName},</p></br></br>
            <p> You receives the message because you do not remember your password </p></br>
            <p>If it is not you, please ignore this message.</p></br>
            <p><a href="${URLtoken}">Link to change password</a></p></br></br>
            <p>Best regards</p></br>
            <p>Team</p>`;

    resp.messageBodyText = `Hello ${firstName},\n\n
            You receives the message because you do not remember your password\n
            If it is not you, please ignore this message.\n
            Link to change password: ${URLtoken}\n\n
            Best regards\n
            Team`;

    return resp;
  }

  private makeActivateAccountEmailMessage(
    firstName: string,
    URLtoken: string,
    lang = LangTypes.en,
  ): MessageBuilderResponse {
    lang;
    const resp: MessageBuilderResponse = {
      messageTopic: ``,
      messageBodyHtml: ``,
      messageBodyText: ``,
    };

    resp.messageTopic = `Welcome !!!`;
    resp.messageBodyHtml = `<p>Hello ${firstName},</p></br></br>
          <p>Welcome.</p></br>
          <p>Here is your account activation link:</p></br>
          <p><a href="${URLtoken}">activation link</a></p></br></br>
          <p>Best regards</p><br>
          <p>Team</p>`;
    resp.messageBodyText = `$Hello ${firstName},\n\n
          Welcome.\n
          Here is your account activation link:\n
          activation link: ${URLtoken}\n\n
          Best regards\n
          Team`;

    return resp;
  }

  // sendResetPasswordToken
  async sendResetPasswordToken(
    token: string,
    email: string,
    firstName: string,
    lang: LangTypes = LangTypes.en,
  ): Promise<boolean> {
    try {
      if (
        !process.env.MAILER_CLIENT_USERNAME ||
        !process.env.MAILER_CLIENT_PASSWORD ||
        !process.env.MAILER_CLIENT_HOST ||
        !process.env.MAILER_CLIENT_PORT
      ) {
        Logger.error(
          'Missing one of variable in .env file: MAILER_CLIENT_USERNAME | MAILER_CLIENT_PASSWORD | MAILER_CLIENT_HOST | MAILER_CLIENT_PORT',
          MailService.name,
        );
        return false;
      }

      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        host: process.env.MAILER_CLIENT_HOST,
        port: +process.env.MAILER_CLIENT_PORT,
        secure: +process.env.MAILER_CLIENT_PORT === 465 ? true : false, // true for 465, false for other ports
        auth: {
          user: process.env.MAILER_CLIENT_USERNAME || '',
          pass: process.env.MAILER_CLIENT_PASSWORD || '',
        },
      });

      const URLToken = `${process.env.FRONT_APP_URL}/auth/resetPassword?token=${token}`;

      const messageData = this.makeResetPasswordEmailMessage(
        firstName,
        URLToken,
        lang,
      );

      // send mail with defined transport object
      const { err } = await transporter.sendMail({
        from: process.env.MAILER_CLIENT_USERNAME || '',
        to: email, // list of receivers
        subject: messageData.messageTopic,
        text: messageData.messageBodyText,
        html: messageData.messageBodyHtml,
      });

      if (err) {
        Logger.error(
          `"sendResetPasswordToken" function error: ${err}`,
          MailService.name,
        );
        return false;
      }

      return true;
    } catch (err) {
      Logger.error(`ERROR - sendResetPasswordToken: ${err}`, MailService.name);
      return false;
    }
  }

  private makeResetPasswordEmailMessage(
    firstName: string,
    URLtoken: string,
    lang = LangTypes.en,
  ): MessageBuilderResponse {
    lang;
    const resp: MessageBuilderResponse = {
      messageTopic: ``,
      messageBodyHtml: ``,
      messageBodyText: ``,
    };

    resp.messageTopic = `Reset password`;
    resp.messageBodyHtml = `<p>Hello ${firstName},</p></br></br>
          <p>You receives the message because you do not remember your password</p></br>
          <p>If it is not you, please ignore this message.</p></br>
          <p><a href="${URLtoken}">Link to change password</a></p></br></br>
          <p>Best regards</p></br>
          <p>Team</p>`;
    resp.messageBodyText = `Hello ${firstName},\n\n
          You receives the message because you do not remember your password\n
          If it is not you, please ignore this message.\n
          Link to change password: ${URLtoken}\n\n
          Best regards\n
          Team`;

    return resp;
  }
}
