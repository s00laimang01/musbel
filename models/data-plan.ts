import { dataPlan } from "@/types";
import mongoose from "mongoose";

const DataPlanSchema: mongoose.Schema<dataPlan> = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  availability: {
    type: String,
    required: true,
  },
  data: {
    type: String,
    required: true,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  network: {
    type: String,
    enum: ["Mtn", "Airtel", "Glo", "9Mobile"],
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["CHEAP", "SME"],
  },
  planId: {
    type: Number,
    required: true,
  },
});

const DataPlan: mongoose.Model<dataPlan> =
  mongoose.models.DataPlan || mongoose.model("DataPlan", DataPlanSchema);

DataPlanSchema.pre("save", async function (next) {
  try {
    const planExist = await DataPlan.exists({
      amount: this.amount,
      network: this.network,
      availability: this.availability,
      data: this.data,
    });

    if (planExist) {
      next(new Error("Plan already exists"));
    }
  } catch (error) {
    const err = error as Error;
    next(err);
  }
});

export { DataPlan };
