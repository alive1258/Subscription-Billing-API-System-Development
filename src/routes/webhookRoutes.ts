import express from "express";
import {
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN,
} from "../controllers/webhookController";

const router = express.Router();

// Payment webhooks (no authentication required)
router.get("/payment/success", paymentSuccess);
router.get("/payment/fail", paymentFail);
router.get("/payment/cancel", paymentCancel);
router.post("/payment/ipn", paymentIPN);

export default router;
