import { Request, Response } from "express";
import Subscription from "../models/Subscription";
import paymentService from "../services/paymentService";
import logger from "../utils/logger";

export const paymentSuccess = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { tran_id, val_id } = req.query;

    if (tran_id && val_id) {
      await paymentService.handlePaymentSuccess(val_id as string);
    }

    // Redirect to success page or send HTML response
    res.send(`
      <html>
        <body>
          <h1>Payment Successful!</h1>
          <p>Your subscription has been activated.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    logger.error("Payment success webhook error:", error);
    res.status(500).send("Payment processing error");
  }
};

export const paymentFail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { tran_id } = req.query;

    if (tran_id) {
      const subscription = await Subscription.findOne({
        transactionId: tran_id,
      });
      if (subscription && subscription.status === "pending") {
        subscription.status = "cancelled";
        await subscription.save();
      }
    }

    res.send(`
      <html>
        <body>
          <h1>Payment Failed</h1>
          <p>Your payment was not successful. Please try again.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    logger.error("Payment fail webhook error:", error);
    res.status(500).send("Payment processing error");
  }
};

export const paymentCancel = async (
  req: Request,
  res: Response,
): Promise<void> => {
  res.send(`
    <html>
      <body>
        <h1>Payment Cancelled</h1>
        <p>You have cancelled the payment process.</p>
        <script>
          setTimeout(() => {
            window.close();
          }, 3000);
        </script>
      </body>
    </html>
  `);
};

export const paymentIPN = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { val_id, status, tran_id } = req.body;

    if (status === "VALID") {
      await paymentService.handlePaymentSuccess(val_id);
    } else {
      const subscription = await Subscription.findOne({
        transactionId: tran_id,
      });
      if (subscription && subscription.status === "pending") {
        subscription.status = "cancelled";
        await subscription.save();
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    logger.error("IPN webhook error:", error);
    res.status(500).send("Error");
  }
};
