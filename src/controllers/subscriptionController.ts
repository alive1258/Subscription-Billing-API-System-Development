import { Response } from "express";
import Subscription from "../models/Subscription";
import Plan from "../models/Plan";
import User from "../models/User";
import paymentService from "../services/paymentService";
import { AuthRequest } from "../middleware/auth";

export const purchaseSubscription = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { planId, autoRenew = false } = req.body;
    const userId = req.userId!;

    // Get plan details
    const plan = await Plan.findById(planId);
    if (!plan) {
      res.status(404).json({
        success: false,
        message: "Plan not found",
      });
      return;
    }

    // Check for existing active subscription for same plan
    const hasActiveSubscription =
      await Subscription.hasActiveSubscriptionForPlan(
        userId as any,
        planId as any,
      );

    if (hasActiveSubscription) {
      res.status(400).json({
        success: false,
        message: "You already have an active subscription for this plan",
      });
      return;
    }

    // Check for any active subscription to determine if upgrade is possible
    const activeSubscription = await Subscription.findOne({
      userId,
      status: "active",
      expiryDate: { $gt: new Date() },
    });

    if (activeSubscription) {
      // Check if this is an upgrade
      const currentPlan = await Plan.findById(activeSubscription.planId);
      if (currentPlan && plan.priority <= currentPlan.priority) {
        res.status(400).json({
          success: false,
          message:
            "You can only upgrade to higher-priced plans. Current plan has equal or higher priority.",
        });
        return;
      }
    }

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.duration);

    // Create subscription
    const subscription = new Subscription({
      userId,
      planId,
      planName: plan.name,
      price: plan.price,
      expiryDate,
      autoRenew,
      status: "pending",
    });

    if (activeSubscription) {
      subscription.upgradedFrom = activeSubscription._id;
    }

    await subscription.save();

    // Initiate payment
    const payment = await paymentService.initiatePayment(
      userId,
      planId,
      subscription._id.toString(),
      autoRenew,
    );

    if (!payment.success) {
      subscription.status = "cancelled";
      await subscription.save();
      res.status(400).json({
        success: false,
        message: payment.error || "Payment initiation failed",
      });
      return;
    }

    res.json({
      success: true,
      message: "Subscription created. Please complete payment.",
      data: {
        subscription,
        paymentUrl: payment.gatewayUrl,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMySubscriptions = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const subscriptions = await Subscription.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate("planId", "name price duration");

    res.json({
      success: true,
      data: subscriptions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelSubscription = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { subscriptionId } = req.params;
    const { reason } = req.body;

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId: req.userId,
    });

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
      return;
    }

    if (subscription.status !== "active") {
      res.status(400).json({
        success: false,
        message: "Only active subscriptions can be cancelled",
      });
      return;
    }

    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = reason;
    await subscription.save();

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
      data: subscription,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSubscriptionDetails = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.subscriptionId,
      userId: req.userId,
    }).populate("planId", "name price duration features");

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
      return;
    }

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getActiveSubscription = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.userId,
      status: "active",
      expiryDate: { $gt: new Date() },
    }).populate("planId", "name price duration features");

    res.json({
      success: true,
      data: subscription || null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
