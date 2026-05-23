import axios, { AxiosResponse } from "axios";
import crypto from "crypto";
import logger from "../utils/logger";

interface PaymentData {
  amount: number;
  transactionId: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  userId: string;
  subscriptionId: string;
}

interface PaymentResponse {
  success: boolean;
  gatewayUrl?: string;
  error?: string;
}

interface ValidationResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class SSLCommerzConfig {
  private store_id: string;
  private store_password: string;
  private is_live: boolean;
  private payment_url: string;
  private validation_url: string;

  constructor() {
    this.store_id = process.env.SSLC_STORE_ID as string;
    this.store_password = process.env.SSLC_STORE_PASSWORD as string;
    this.is_live = process.env.SSLC_TESTMODE === "false";
    this.payment_url = process.env.SSLC_PAYMENT_URL as string;
    this.validation_url = process.env.SSLC_VALIDATION_URL as string;
  }

  private generateHash(data: any): string {
    const hashString = Object.values(data).join("");
    return crypto.createHash("sha256").update(hashString).digest("hex");
  }

  async initiatePayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const postData = {
        store_id: this.store_id,
        store_passwd: this.store_password,
        total_amount: paymentData.amount,
        currency: "BDT",
        tran_id: paymentData.transactionId,
        success_url: paymentData.successUrl,
        fail_url: paymentData.failUrl,
        cancel_url: paymentData.cancelUrl,
        ipn_url: paymentData.ipnUrl,
        shipping_method: "NO",
        product_name: paymentData.productName,
        product_category: "Subscription",
        product_profile: "general",
        cus_name: paymentData.customerName,
        cus_email: paymentData.customerEmail,
        cus_phone: paymentData.customerPhone,
        cus_add1: "N/A",
        cus_city: "N/A",
        cus_country: "Bangladesh",
        multi_card_name: "mastercard,visacard,amexcard",
        value_a: paymentData.userId,
        value_b: paymentData.subscriptionId,
      };

      const response: AxiosResponse = await axios.post(
        this.payment_url,
        new URLSearchParams(postData),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );

      if (response.data.status === "SUCCESS") {
        return { success: true, gatewayUrl: response.data.GatewayPageURL };
      }

      logger.error("SSLCommerz payment initiation failed:", response.data);
      return {
        success: false,
        error: response.data.failedreason || "Payment initiation failed",
      };
    } catch (error: any) {
      logger.error("SSLCommerz API error:", error.message);
      return { success: false, error: error.message };
    }
  }

  async validatePayment(transactionId: string): Promise<ValidationResponse> {
    try {
      const validationData = {
        store_id: this.store_id,
        store_passwd: this.store_password,
        val_id: transactionId,
        format: "json",
      };

      const response: AxiosResponse = await axios.get(this.validation_url, {
        params: validationData,
      });

      if (response.data.status === "VALID") {
        return { success: true, data: response.data };
      }

      return { success: false, error: "Invalid payment" };
    } catch (error: any) {
      logger.error("Payment validation error:", error.message);
      return { success: false, error: error.message };
    }
  }
}

export default new SSLCommerzConfig();
