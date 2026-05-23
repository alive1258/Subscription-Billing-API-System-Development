import { Request, Response } from "express";
import Plan from "../models/Plan";
import { AuthRequest } from "../middleware/auth";

export const createPlan = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const plan = new Plan(req.body);
    await plan.save();

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: plan,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllPlans = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });

    res.json({
      success: true,
      data: plans,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPlanById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      res.status(404).json({
        success: false,
        message: "Plan not found",
      });
      return;
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePlan = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      res.status(404).json({
        success: false,
        message: "Plan not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Plan updated successfully",
      data: plan,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePlan = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);

    if (!plan) {
      res.status(404).json({
        success: false,
        message: "Plan not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
