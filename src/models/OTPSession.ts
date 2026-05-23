import mongoose, { Document, Schema } from "mongoose";

export interface IOTPSession extends Document {
  email: string;
  otp: string;
  purpose: "login" | "verification" | "password_reset";
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

const otpSessionSchema = new Schema<IOTPSession>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["login", "verification", "password_reset"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      index: { expiresAfterSeconds: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index for cleanup
otpSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOTPSession>("OTPSession", otpSessionSchema);
