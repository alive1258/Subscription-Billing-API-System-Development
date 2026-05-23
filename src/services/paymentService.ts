import sslcommerz from "../config/sslcommerz";
import Subscription from "../models/Subscription";
import User from "../models/User";
import Plan from "../models/Plan";
import emailService from "./emailService";
import logger from "../utils/logger";

interface PaymentInitiationResponse {
  success: boolean;
  gatewayUrl?: string;
  error?: string;
}

class PaymentService {
  async initiatePayment(
    userId: string,
    planId: string,
    subscriptionId: string,
    autoRenew: boolean = false,
  ): Promise<PaymentInitiationResponse> {
    try {
      const user = await User.findById(userId);
      const plan = await Plan.findById(planId);
      const subscription = await Subscription.findById(subscriptionId);

      if (!user || !plan || !subscription) {
        throw new Error("Invalid user, plan, or subscription");
      }

      const transactionId = `TXN_${Date.now()}_${userId.slice(-6)}`;

      const paymentResult = await sslcommerz.initiatePayment({
        amount: plan.price,
        transactionId,
        successUrl: `${process.env.APP_URL}/api/webhooks/payment/success`,
        failUrl: `${process.env.APP_URL}/api/webhooks/payment/fail`,
        cancelUrl: `${process.env.APP_URL}/api/webhooks/payment/cancel`,
        ipnUrl: `${process.env.APP_URL}/api/webhooks/payment/ipn`,
        productName: plan.name,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone,
        userId: userId,
        subscriptionId: subscriptionId,
      });

      if (paymentResult.success) {
        // Update subscription with transaction ID
        subscription.transactionId = transactionId;
        await subscription.save();

        return { success: true, gatewayUrl: paymentResult.gatewayUrl };
      }

      return { success: false, error: paymentResult.error };
    } catch (error: any) {
      logger.error("Payment initiation error:", error);
      return { success: false, error: error.message };
    }
  }

  async handlePaymentSuccess(transactionId: string): Promise<void> {
    try {
      const validation = await sslcommerz.validatePayment(transactionId);

      if (validation.success) {
        const subscription = await Subscription.findOne({ transactionId });

        if (subscription && subscription.status === "pending") {
          subscription.status = "active";
          subscription.paymentDetails = {
            method: "SSLCommerz",
            transactionId: transactionId,
            paidAt: new Date(),
            amount: subscription.price,
          };
          await subscription.save();

          // Send confirmation email
          const user = await User.findById(subscription.userId);
          if (user) {
            await emailService.sendSubscriptionConfirmation(
              user.email,
              subscription.planName,
              subscription.expiryDate,
              subscription.price,
            );
          }
        }
      }
    } catch (error) {
      logger.error("Payment success handling error:", error);
    }
  }
}

export default new PaymentService();
