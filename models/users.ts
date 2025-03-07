import { validatePhoneNumber } from "@/lib/utils";
import { IUser } from "@/types";
import mongoose from "mongoose";

const UserSchema: mongoose.Schema<IUser> = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide a name"],
    },
    auth: {
      email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Please provide a valid email",
        ],
        trim: true,
      },
      password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 6,
        select: false,
      },
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide a phone number"],
      unique: true,
      trim: true,
    },
    country: {
      type: String,
      enum: ["nigeria"],
      lowercase: true,
      default: "nigeria",
    },
    balance: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ["user"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  this.isEmailVerified = !this.isModified("auth.email");
  this.isPhoneVerified = !this.isModified("phoneNumber");

  next();
});

// After the user is created create an account number for the user --->
UserSchema.post("save", async function (doc) {});

const User: mongoose.Model<IUser> =
  mongoose.models.User || mongoose.model("User", UserSchema);

const findUser = async (
  id: string,
  options = { includePassword: false, throwOn404: false }
) => {
  const u = await User.findById(id).select(
    options.includePassword ? "+auth.password" : ""
  );

  if (options.throwOn404 && !u) throw new Error("User not found");

  return u;
};

const findUserByEmail = async (
  email: string,
  options = { includePassword: false, throwOn404: false }
) => {
  const u = await User.findOne({ "auth.email": email }).select(
    options.includePassword ? "+auth.password" : ""
  );

  if (options.throwOn404 && !u) throw new Error("User not found");

  return u;
};

export { User, findUser, findUserByEmail };
