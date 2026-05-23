import OTPSession, { IOTPSession } from "../models/OTPSession";
import emailService from "./emailService";

interface OTPResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class OTPService {
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(
    email: string,
    purpose: IOTPSession["purpose"],
  ): Promise<OTPResponse> {
    try {
      // Remove old OTPs for this email and purpose
      await OTPSession.deleteMany({ email, purpose, verified: false });

      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const otpSession = new OTPSession({
        email,
        otp,
        purpose,
        expiresAt,
      });

      await otpSession.save();

      // Send email based on purpose
      if (purpose === "verification") {
        await emailService.sendVerificationEmail(email, otp);
      } else if (purpose === "login") {
        await emailService.sendLoginOTP(email, otp);
      }

      return { success: true, message: "OTP sent successfully" };
    } catch (error: any) {
      console.error("OTP send error:", error);
      return { success: false, error: error.message };
    }
  }

  async verifyOTP(
    email: string,
    otp: string,
    purpose: IOTPSession["purpose"],
  ): Promise<OTPResponse> {
    try {
      const otpSession = await OTPSession.findOne({
        email,
        otp,
        purpose,
        verified: false,
        expiresAt: { $gt: new Date() },
      });

      if (!otpSession) {
        return { success: false, error: "Invalid or expired OTP" };
      }

      // Check attempts
      if (otpSession.attempts >= 5) {
        await otpSession.deleteOne();
        return {
          success: false,
          error: "Too many failed attempts. Please request a new OTP.",
        };
      }

      otpSession.verified = true;
      otpSession.attempts += 1;
      await otpSession.save();

      return { success: true, message: "OTP verified successfully" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export default new OTPService();
