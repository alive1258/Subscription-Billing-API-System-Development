import mongoose, { Document, Schema } from "mongoose";

export interface IPlan extends Document {
  name: string;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
  priority: number;
  description?: string;
}

const planSchema = new Schema<IPlan>(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      unique: true,
      trim: true,
      minlength: [3, "Plan name must be at least 3 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 day"],
      description: "Duration in days",
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
      description: "Higher priority means higher tier plan",
    },
    description: String,
  },
  {
    timestamps: true,
  },
);

// Index for sorting
planSchema.index({ price: 1 });
planSchema.index({ priority: -1 });

export default mongoose.model<IPlan>("Plan", planSchema);
