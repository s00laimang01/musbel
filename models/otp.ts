import mongoose from "mongoose";
import { otp } from "@/types";

const OtpSchema: mongoose.Schema<otp> = new mongoose.Schema(
  {
    expirationTime: {
      type: Date,
      // Expiration time in 15 minutes
      default: () => new Date(Date.now() + 15 * 60000),
      expires: "15m",
    },
    otp: {
      type: String, // Corrected from "String" to String
      required: true,
      trim: true,
      maxlength: 6, // Optional: Add max length for OTP
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Best practice: Use PascalCase for model names
      index: true,
      required: true,
    },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields
  }
);

// Create a TTL index for automatic document expiration
OtpSchema.index({ expirationTime: 1 }, { expireAfterSeconds: 0 });

// Prevent multiple models from being created
const OTP: mongoose.Model<otp> =
  mongoose.models.Otp || mongoose.model<otp>("Otp", OtpSchema);

export { OTP };
