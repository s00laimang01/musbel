import { exam, examType } from "@/types";
import mongoose from "mongoose";

const ExamSchema: mongoose.Schema<exam> = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    validate: {
      validator(amount: number) {
        return amount > 0;
      },
      message: "Amount must be greater than 0",
    },
  },
  examId: {
    type: Number,
    required: true,
    unique: true,
  },
  examType: {
    type: String,
    enum: ["nabteb", "neco", "waec"] as examType[],
    required: true,
  },
});

const Exam: mongoose.Model<exam> =
  mongoose.models.Exam || mongoose.model("Exam", ExamSchema);

export { Exam };
