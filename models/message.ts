import { systemMessage } from "@/types";
import mongoose from "mongoose";

const SystemMessageSchema: mongoose.Schema<systemMessage> = new mongoose.Schema(
  {
    message: {
      type: String,
      maxlength: 2000,
    },
    messageId: {
      type: String,
      required: true,
      maxlength: 100,
    },
    title: {
      type: String,
      maxlength: 255,
    },
  },
  { timestamps: true }
);

SystemMessageSchema.methods.updateMessage = async function (
  message: string,
  title?: string
) {
  this.message = message;
  this.messageId = new mongoose.Types.ObjectId().toString();
  this.title = title;

  await this.save();
  return this;
};

const SystemMessage: mongoose.Model<systemMessage> =
  mongoose.models.SystemMessage ||
  mongoose.model("SystemMessage", SystemMessageSchema);

export { SystemMessage };
