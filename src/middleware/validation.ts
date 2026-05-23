import { body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validate = (validations: any[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: (err as any).path,
        message: err.msg,
      })),
    });
  };
};

// Validation rules
export const userValidation = {
  register: [
    body("name")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be 2-50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("phone")
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage("Valid phone number required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  login: [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  otpVerify: [
    body("email").isEmail().normalizeEmail(),
    body("otp").isLength({ min: 6, max: 6 }).isNumeric(),
  ],
};

export const planValidation = {
  create: [
    body("name").trim().notEmpty().withMessage("Plan name required"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("duration")
      .isInt({ min: 1 })
      .withMessage("Duration must be at least 1 day"),
    body("priority").optional().isInt({ min: 0 }),
  ],
  update: [
    param("id").isMongoId().withMessage("Invalid plan ID"),
    body("name").optional().trim().notEmpty(),
    body("price").optional().isFloat({ min: 0 }),
    body("duration").optional().isInt({ min: 1 }),
  ],
};

export const subscriptionValidation = {
  purchase: [
    body("planId").isMongoId().withMessage("Valid plan ID required"),
    body("autoRenew").optional().isBoolean(),
  ],
  cancel: [
    param("subscriptionId")
      .isMongoId()
      .withMessage("Valid subscription ID required"),
    body("reason").optional().trim().isLength({ max: 500 }),
  ],
};

export const webhookValidation = {
  payment: [
    body("val_id").notEmpty(),
    body("tran_id").notEmpty(),
    body("status").notEmpty(),
  ],
};
