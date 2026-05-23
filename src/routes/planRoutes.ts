import express from "express";
import {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} from "../controllers/planController";
import { authMiddleware, adminMiddleware } from "../middleware/auth";
import { validate, planValidation } from "../middleware/validation";

const router = express.Router();

/**
 * @swagger
 * /plans:
 *   get:
 *     summary: Get all plans
 *     tags: [Plans]
 *     responses:
 *       200:
 *         description: List of all plans
 */
router.get("/", getAllPlans);

/**
 * @swagger
 * /plans/{id}:
 *   get:
 *     summary: Get plan by ID
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan details
 */
router.get("/:id", getPlanById);

// Admin only routes
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validate(planValidation.create),
  createPlan,
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(planValidation.update),
  updatePlan,
);
router.delete("/:id", authMiddleware, adminMiddleware, deletePlan);

export default router;
