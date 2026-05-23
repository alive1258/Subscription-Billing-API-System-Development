import express from "express";
import {
  purchaseSubscription,
  getMySubscriptions,
  cancelSubscription,
  getSubscriptionDetails,
  getActiveSubscription,
} from "../controllers/subscriptionController";
import { authMiddleware } from "../middleware/auth";
import { validate, subscriptionValidation } from "../middleware/validation";

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /subscriptions:
 *   get:
 *     summary: Get user's subscriptions
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's subscriptions
 */
router.get("/", getMySubscriptions);

/**
 * @swagger
 * /subscriptions/active:
 *   get:
 *     summary: Get user's active subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active subscription details
 */
router.get("/active", getActiveSubscription);

/**
 * @swagger
 * /subscriptions/purchase:
 *   post:
 *     summary: Purchase a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *               autoRenew:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Subscription created
 */
router.post(
  "/purchase",
  validate(subscriptionValidation.purchase),
  purchaseSubscription,
);

/**
 * @swagger
 * /subscriptions/{subscriptionId}:
 *   get:
 *     summary: Get subscription details
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription details
 */
router.get("/:subscriptionId", getSubscriptionDetails);

/**
 * @swagger
 * /subscriptions/{subscriptionId}/cancel:
 *   post:
 *     summary: Cancel a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscription cancelled
 */
router.post(
  "/:subscriptionId/cancel",
  validate(subscriptionValidation.cancel),
  cancelSubscription,
);

export default router;
