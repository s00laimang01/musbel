import mongoose, { Schema, type Document } from "mongoose";
import type { Model } from "mongoose";

export interface IPasswordResetToken extends Document {
  email: string;
  token: string;
  otp: string;
  expires: Date;
  createdAt: Date;
}

const PasswordResetTokenSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    token: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    expires: { type: Date, required: true },
  },
  { timestamps: true }
);

// Check if the model is already defined to prevent overwriting during hot reloads
const PasswordResetToken =
  (mongoose.models.PasswordResetToken as Model<IPasswordResetToken>) ||
  mongoose.model<IPasswordResetToken>(
    "PasswordResetToken",
    PasswordResetTokenSchema
  );

export default PasswordResetToken;
