import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Attachment } from 'nodemailer/lib/mailer';
import { createTransport } from 'nodemailer';
import { RedisService } from './redis.service';
import { SecurityService } from '../module/security/security.service';

@Injectable()
export class EmailService {
  private MAIL_USER: string;
  private MAIL_PASS: string;

  constructor(
    private _configService: ConfigService,
    private _redisService: RedisService,
    private _securityService: SecurityService,
  ) {
    this.MAIL_USER = this._configService.get<string>('MAIL_USER') as string;
    this.MAIL_PASS = this._configService.get<string>('MAIL_PASS') as string;
  }
  async sendEmail({
    to,
    subject,
    text,
    html,
    attachments,
  }: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Attachment[];
  }) {
    const transporter = createTransport({
      service: 'gmail',
      auth: {
        user: this.MAIL_USER,
        pass: this.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    const info = await transporter.sendMail({
      from: `"Route " <${this.MAIL_USER}>`, // sender address
      to, // list of receivers
      subject,
      text, // Plain-text version of the message
      html, // HTML version of the message
      attachments,
    });

    console.log('Email sent:', info.messageId);
  }

  generateOTP() {
    return Math.ceil(Math.random() * 900000 + 100000);
  }


  async sendEmailOTP({ email, emailType, subject }) {
    const pervOtpTTL = await this._redisService.ttl({
      key: this._redisService.getOTPKey({ email, emailType }),
    });

    if (pervOtpTTL > 0) {
      throw new BadRequestException(
        `There is already OTP valid for ${pervOtpTTL} seconds`,
      );
    }

    const isBlocked = await this._redisService.exists({
      key: this._redisService.getOTPReqBlockedKey({
        email,
        emailType,
      }),
    });

    if (isBlocked) {
      throw new BadRequestException('Try again later');
    }

    const reqNo = await this._redisService.get({
      key: this._redisService.getOTPReqNoKey({
        email,
        emailType,
      }),
    });

    if (Number(reqNo) == 5) {
      await this._redisService.set({
        key: this._redisService.getOTPReqBlockedKey({
          email,
          emailType,
        }),
        value: 1,
        exValue: 10 * 60,
      });

      throw new BadRequestException(
        'You cannot request more than 5 emails in 20m',
      );
    }
    const otp = this.generateOTP();

    await this.sendEmail({
      to: email,
      subject,
      html: `<h1> Your OTP ${otp} </h1>`,
    });

    await this._redisService.set({
      key: this._redisService.getOTPKey({
        email,
        emailType,
      }),
      value: await this._securityService.hashOperation({
        plainValue: otp.toString(),
      }),
      exValue: 120,
    });

    await this._redisService.incr({
      key: this._redisService.getOTPReqNoKey({
        email,
        emailType,
      }),
    });
  }
}
