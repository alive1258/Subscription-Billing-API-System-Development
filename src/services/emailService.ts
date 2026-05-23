import nodemailer from "nodemailer";
import logger from "../utils/logger";

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || "465"),
      secure: process.env.MAIL_SECURE === "true",
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<EmailResponse> {
    try {
      const info = await this.transporter.sendMail({
        from: `"Subscription Billing" <${process.env.SMTP_USERNAME}>`,
        to,
        subject,
        html,
      });

      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      logger.error("Email sending failed:", error);
      return { success: false, error: error.message };
    }
  }

  async sendVerificationEmail(
    email: string,
    otp: string,
  ): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Thank you for registering! Please verify your email address using the OTP below:</p>
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
          ${otp}
        </div>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Subscription Billing System</p>
      </div>
    `;

    return this.sendEmail(email, "Verify Your Email Address", html);
  }

  async sendLoginOTP(email: string, otp: string): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Login Verification Code</h2>
        <p>Your login verification code is:</p>
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
          ${otp}
        </div>
        <p>This code is valid for 10 minutes.</p>
        <p>If you didn't attempt to login, please secure your account immediately.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Subscription Billing System</p>
      </div>
    `;

    return this.sendEmail(email, "Login Verification Code", html);
  }

  async sendSubscriptionConfirmation(
    email: string,
    planName: string,
    expiryDate: Date,
    amount: number,
  ): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Subscription Confirmed!</h2>
        <p>Your subscription has been successfully activated.</p>
        <div style="background: #e8f5e9; padding: 15px; border-radius: 5px;">
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Expires on:</strong> ${expiryDate.toLocaleDateString()}</p>
        </div>
        <p>Thank you for choosing our service!</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Subscription Billing System</p>
      </div>
    `;

    return this.sendEmail(email, "Subscription Activated", html);
  }
}

export default new EmailService();
