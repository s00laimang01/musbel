import mongoose from "mongoose";
import { IReferral } from "@/types";

const ReferralSchema = new mongoose.Schema<IReferral>(
  {
    referralCode: { type: String, required: true },
    referree: { type: String, required: true, unique: true },
    user: { type: String, required: true },
    rewardClaimed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Referral: mongoose.Model<IReferral> =
  mongoose.models.Referral || mongoose.model("Referral", ReferralSchema);

export { Referral };
