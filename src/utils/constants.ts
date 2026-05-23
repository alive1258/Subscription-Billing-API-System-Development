export const CONSTANTS = {
  // User Roles
  USER_ROLES: {
    USER: "user",
    ADMIN: "admin",
  } as const,

  // Subscription Status
  SUBSCRIPTION_STATUS: {
    ACTIVE: "active",
    EXPIRED: "expired",
    CANCELLED: "cancelled",
    PENDING: "pending",
  } as const,

  // OTP Purposes
  OTP_PURPOSES: {
    LOGIN: "login",
    VERIFICATION: "verification",
    PASSWORD_RESET: "password_reset",
  } as const,

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
  } as const,

  // API Response Messages
  MESSAGES: {
    // Success Messages
    REGISTRATION_SUCCESS:
      "Registration successful. Please verify your email with OTP.",
    LOGIN_SUCCESS: "Login successful",
    LOGOUT_SUCCESS: "Logged out successfully",
    EMAIL_VERIFIED: "Email verified successfully",
    OTP_SENT: "OTP sent to your email",
    OTP_VERIFIED: "OTP verified successfully",
    PLAN_CREATED: "Plan created successfully",
    PLAN_UPDATED: "Plan updated successfully",
    PLAN_DELETED: "Plan deleted successfully",
    SUBSCRIPTION_CREATED: "Subscription created. Please complete payment.",
    SUBSCRIPTION_CANCELLED: "Subscription cancelled successfully",
    PAYMENT_SUCCESS: "Payment successful",

    // Error Messages
    USER_EXISTS: "User already exists with this email or phone",
    USER_NOT_FOUND: "User not found",
    INVALID_CREDENTIALS: "Invalid email or password",
    INVALID_OTP: "Invalid or expired OTP",
    TOO_MANY_ATTEMPTS: "Too many failed attempts. Please request a new OTP.",
    PLAN_NOT_FOUND: "Plan not found",
    SUBSCRIPTION_NOT_FOUND: "Subscription not found",
    ACTIVE_SUBSCRIPTION_EXISTS:
      "You already have an active subscription for this plan",
    CANNOT_UPGRADE: "You can only upgrade to higher-priced plans",
    PAYMENT_FAILED: "Payment initiation failed",
    ACCESS_DENIED: "Access denied. Admin privileges required.",
    TOKEN_MISSING: "No token provided. Please login first.",
    TOKEN_INVALID: "Invalid token",
    TOKEN_EXPIRED: "Token expired. Please login again.",
    EMAIL_NOT_VERIFIED: "Please verify your email address first.",
    ROUTE_NOT_FOUND: "Route not found",
  } as const,

  // Validation Rules
  VALIDATION: {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    PASSWORD_MIN_LENGTH: 6,
    OTP_LENGTH: 6,
    OTP_EXPIRY_MINUTES: 10,
    OTP_MAX_ATTEMPTS: 5,
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100,
  } as const,

  // Database
  DATABASE: {
    MONGODB_URI:
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/subscription_billing",
  } as const,

  // JWT
  JWT: {
    SECRET: process.env.JWT_SECRET || "default-secret-key-change-me",
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  } as const,

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  } as const,

  // Subscription
  SUBSCRIPTION: {
    DEFAULT_AUTO_RENEW: false,
    GRACE_PERIOD_DAYS: 3,
  } as const,

  // Email Templates
  EMAIL_TEMPLATES: {
    VERIFICATION_SUBJECT: "Verify Your Email Address",
    LOGIN_OTP_SUBJECT: "Login Verification Code",
    SUBSCRIPTION_CONFIRMATION_SUBJECT: "Subscription Activated",
    PASSWORD_RESET_SUBJECT: "Password Reset Request",
  } as const,

  // Payment Gateway
  PAYMENT: {
    CURRENCY: "BDT",
    SSLCOMMERZ: {
      TEST_MODE: true,
      SUCCESS_URL: "/api/webhooks/payment/success",
      FAIL_URL: "/api/webhooks/payment/fail",
      CANCEL_URL: "/api/webhooks/payment/cancel",
      IPN_URL: "/api/webhooks/payment/ipn",
    },
  } as const,
} as const;

// Type exports for TypeScript
export type UserRole =
  (typeof CONSTANTS.USER_ROLES)[keyof typeof CONSTANTS.USER_ROLES];
export type SubscriptionStatus =
  (typeof CONSTANTS.SUBSCRIPTION_STATUS)[keyof typeof CONSTANTS.SUBSCRIPTION_STATUS];
export type OTPPurpose =
  (typeof CONSTANTS.OTP_PURPOSES)[keyof typeof CONSTANTS.OTP_PURPOSES];
export type HttpStatusCode =
  (typeof CONSTANTS.HTTP_STATUS)[keyof typeof CONSTANTS.HTTP_STATUS];
