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
      transactionPin: {
        type: String,
        select: false,
        min: [4, "Transaction pin must be at least 4 characters"],
        max: [4, "Transaction pin must be at most 4 characters"],
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
    hasSetPin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  this.isEmailVerified = !this.isModified("auth.email");
  this.isPhoneVerified = !this.isModified("phoneNumber");

  if (this.auth.transactionPin) {
    if (this.auth.transactionPin.length !== 4) {
      next(new Error("PIN must be 4 digits"));
    }

    if (/^(.)\1{3}$/.test(this.auth.transactionPin)) {
      next(new Error("PIN cannot be all the same digits"));
    }

    if (
      /^(0123|1234|2345|3456|4567|5678|6789|7890)$/.test(
        this.auth.transactionPin
      )
    ) {
      next(new Error("PIN cannot be sequential digits"));
    }

    this.hasSetPin = true;
  }

  next();
});

// After the user is created create a dedicated account number for the user --->
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

const verifyUserTransactionPin = async (
  userEmail: string,
  userPin: string,
  throwOnIncorrect = true
) => {
  const isPinValid = await User.findOne({
    "auth.email": userEmail,
    "auth.transactionPin": userPin,
  });

  if (!isPinValid && throwOnIncorrect) {
    const error = new Error("Incorrect transaction pin");
    throw error;
  }

  return Boolean(isPinValid);
};

const verifyUserBalance = async (userEmail: string, requiredAmount: number) => {
  const user = await findUserByEmail(userEmail);

  if (!user) {
    throw new Error("User not found");
  }

  if (
    isNaN(requiredAmount) ||
    typeof requiredAmount !== "number" ||
    requiredAmount <= 0
  ) {
    throw new Error("Invalid amount");
  }

  // Check if the user has sufficient balance
  if (requiredAmount > user.balance) {
    throw new Error("Insufficient balance");
  }
};

export {
  User,
  findUser,
  findUserByEmail,
  verifyUserTransactionPin,
  verifyUserBalance,
};
