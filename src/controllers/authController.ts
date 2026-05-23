import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import OTPSession from "../models/OTPSession";
import otpService from "../services/otpService";
import { AuthRequest } from "../middleware/auth";

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User already exists with this email or phone",
      });
      return;
    }

    // Create user
    const user = new User({
      name,
      email,
      phone,
      password,
    });

    await user.save();

    // Send OTP for email verification
    await otpService.sendOTP(email, "verification");

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email with OTP.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendLoginOTP = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    await otpService.sendOTP(email, "login");

    res.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyLoginOTP = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, otp, password } = req.body;

    // Verify OTP
    const otpVerification = await otpService.verifyOTP(email, otp, "login");
    if (!otpVerification.success) {
      res.status(400).json({
        success: false,
        message: otpVerification.error,
      });
      return;
    }

    // Find user and verify password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid password",
      });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const otpVerification = await otpService.verifyOTP(
      email,
      otp,
      "verification",
    );
    if (!otpVerification.success) {
      res.status(400).json({
        success: false,
        message: otpVerification.error,
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    user.isEmailVerified = true;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  // Client-side token removal is sufficient for JWT
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};
