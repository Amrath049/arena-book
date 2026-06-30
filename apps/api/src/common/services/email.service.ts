import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(
      this.configService.get<string>('SENDGRID_API_KEY') as string,
    );
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
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: #f8fafc;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            .wrapper {
              width: 100%;
              background-color: #f8fafc;
              padding: 40px 20px;
              box-sizing: border-box;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 16px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
              overflow: hidden;
              border: 1px solid #e2e8f0;
            }
            .header {
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              padding: 30px;
              text-align: center;
              color: #ffffff;
              border-bottom: 4px solid #10b981;
            }
            .brand-name {
              font-size: 24px;
              font-weight: 800;
              letter-spacing: 0.5px;
              margin: 0;
              color: #ffffff;
            }
            .brand-accent {
              color: #10b981;
            }
            .brand-subtitle {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #94a3b8;
              margin: 5px 0 0 0;
            }
            .body-content {
              padding: 40px 30px;
              color: #334155;
            }
            .greeting {
              font-size: 18px;
              font-weight: 700;
              margin-top: 0;
              margin-bottom: 12px;
              color: #0f172a;
            }
            .text {
              font-size: 15px;
              line-height: 1.6;
              color: #475569;
              margin-bottom: 24px;
            }
            .scoreboard-box {
              background-color: #0f172a;
              border-radius: 12px;
              padding: 24px;
              text-align: center;
              margin: 28px 0;
              border: 1px solid #334155;
            }
            .scoreboard-title {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #94a3b8;
              margin: 0 0 12px 0;
            }
            .otp-code {
              font-family: "Courier New", Courier, monospace;
              font-size: 38px;
              font-weight: 800;
              color: #10b981;
              letter-spacing: 10px;
              padding-left: 10px;
              margin: 0;
            }
            .expiry-note {
              font-size: 13px;
              color: #64748b;
              text-align: center;
              margin-top: -12px;
              margin-bottom: 28px;
            }
            .divider {
              height: 1px;
              background-color: #e2e8f0;
              margin: 24px 0;
            }
            .security-notice {
              background-color: #fef2f2;
              border-left: 4px solid #ef4444;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 16px;
            }
            .security-title {
              font-size: 14px;
              font-weight: 700;
              color: #991b1b;
              margin: 0 0 6px 0;
            }
            .security-list {
              margin: 0;
              padding-left: 20px;
              font-size: 13px;
              color: #7f1d1d;
              line-height: 1.5;
            }
            .footer {
              background-color: #f8fafc;
              padding: 24px 30px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
            }
            .footer p {
              margin: 4px 0;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1 class="brand-name">⚡ Arena<span class="brand-accent">Book</span></h1>
                <p class="brand-subtitle">Your Game, Your Court</p>
              </div>
              <div class="body-content">
                <h2 class="greeting">Ready to enter the arena?</h2>
                <p class="text">Hello,</p>
                <p class="text">We received a request to verify your email address for your ArenaBook account. Use the digital OTP ticket below to complete your verification:</p>
                
                <div class="scoreboard-box">
                  <p class="scoreboard-title">Verification Ticket</p>
                  <div class="otp-code">${otp}</div>
                </div>
                
                <p class="expiry-note">⚡ This code is valid for <strong>${expiryMinutes} minutes</strong>.</p>
                
                <div class="divider"></div>
                
                <div class="security-notice">
                  <h3 class="security-title">🛡️ Security Reminder</h3>
                  <ul class="security-list">
                    <li>Never share this verification code with anyone.</li>
                    <li>ArenaBook staff will never ask for your password or OTP.</li>
                    <li>If you did not request this email, you can safely ignore it.</li>
                  </ul>
                </div>
              </div>
              <div class="footer">
                <p>This is an automated system notification. Please do not reply directly.</p>
                <p>&copy; ${new Date().getFullYear()} ArenaBook. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }
}
