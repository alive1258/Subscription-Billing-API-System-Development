import mongoose, { Document, Schema, Model } from "mongoose";
import { IPlan } from "./Plan";

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  planName: string;
  price: number;
  startDate: Date;
  expiryDate: Date;
  status: "active" | "expired" | "cancelled" | "pending";
  autoRenew: boolean;
  transactionId?: string;
  paymentDetails?: {
    method: string;
    transactionId: string;
    paidAt: Date;
    amount: number;
  };
  cancelledAt?: Date;
  cancellationReason?: string;
  upgradedFrom?: mongoose.Types.ObjectId;
  canUpgradeTo(newPlan: IPlan): Promise<boolean>;
}

interface ISubscriptionModel extends Model<ISubscription> {
  hasActiveSubscriptionForPlan(
    userId: mongoose.Types.ObjectId,
    planId: mongoose.Types.ObjectId,
  ): Promise<boolean>;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "pending",
      index: true,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentDetails: {
      method: String,
      transactionId: String,
      paidAt: Date,
      amount: Number,
    },
    cancelledAt: Date,
    cancellationReason: String,
    upgradedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for active subscription checks
subscriptionSchema.index({ userId: 1, status: 1, expiryDate: 1 });

// Virtual for checking if subscription is active
subscriptionSchema.virtual("isActive").get(function (this: ISubscription) {
  return this.status === "active" && new Date() < this.expiryDate;
});

// Method to check if subscription can be upgraded
subscriptionSchema.methods.canUpgradeTo = async function (
  this: ISubscription,
  newPlan: IPlan,
): Promise<boolean> {
  if (this.status !== "active") return false;
  const currentPlan = (await mongoose
    .model("Plan")
    .findById(this.planId)) as IPlan;
  return newPlan.priority > currentPlan.priority;
};

// Static method to check duplicate active subscription
subscriptionSchema.statics.hasActiveSubscriptionForPlan = async function (
  userId: mongoose.Types.ObjectId,
  planId: mongoose.Types.ObjectId,
): Promise<boolean> {
  const activeSub = await this.findOne({
    userId,
    planId,
    status: "active",
    expiryDate: { $gt: new Date() },
  });
  return !!activeSub;
};

export default mongoose.model<ISubscription, ISubscriptionModel>(
  "Subscription",
  subscriptionSchema,
);
