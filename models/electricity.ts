import { electricity } from "@/types";
import mongoose from "mongoose";

const ElectricitySchema: mongoose.Schema<electricity> = new mongoose.Schema(
  {
    discoId: {
      type: String,
      required: true,
    },
    discoName: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

const Electricity: mongoose.Model<electricity> =
  mongoose.models.Electricity ||
  mongoose.model("Electricity", ElectricitySchema);

export { Electricity };
