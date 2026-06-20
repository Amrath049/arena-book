import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY') as string);
  }

  async sendOtpEmail(email: string, otp: string, expiryMinutes: number = 10) {
    await sgMail.send({
      from: this.configService.get<string>('EMAIL_FROM') as string,
      to: email,
      subject: 'Your OTP Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .otp-box { background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; }
            .warning { color: #dc2626; font-size: 14px; margin-top: 20px; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Email Verification</h2>
            <p>Hello,</p>
            <p>Your One-Time Password (OTP) for verification is:</p>

            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>

            <p>This OTP is valid for <strong>${expiryMinutes} minutes</strong>.</p>

            <div class="warning">
              <p><strong>Security Notice:</strong></p>
              <ul style="text-align: left;">
                <li>Never share this OTP with anyone</li>
                <li>Our team will never ask for your OTP</li>
                <li>If you didn't request this OTP, please ignore this email</li>
              </ul>
            </div>

            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Play Arena. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }
}
