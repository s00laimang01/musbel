import type { dedicatedAccountNumber } from "@/types";
import mongoose from "mongoose";
import { findUserByEmail } from "./users";
import { createVirtualAccount } from "@/lib/utils";
import { configs } from "@/lib/constants";
import bcrypt from "bcryptjs";

const AccountSchema: mongoose.Schema<dedicatedAccountNumber> =
  new mongoose.Schema(
    {
      accountDetails: {
        accountName: { type: String },
        accountNumber: {
          type: String,
          validate: {
            validator(accountNumber) {
              if (accountNumber && accountNumber.length < 10) {
                return false;
              }
            },
            message: "Account number must be at least 10 characters long",
          },
        },
        accountRef: { type: String },
        bankName: { type: String },
        bankCode: { type: String },
        expirationDate: { type: String },
      },
      bvn: {
        type: String,
        required: true,
        minlength: 11,
        unique: true,
        // We'll handle validation separately to avoid issues with hashing
      },
      user: { type: String, ref: "User", index: true, unique: true },
      hasDedicatedAccountNumber: { type: Boolean, default: false },
      order_ref: { type: String },
      flw_ref: { type: String },
    },
    { timestamps: true }
  );

// Hash BVN before saving
AccountSchema.pre("save", async function (next) {
  // Only hash the BVN if it's modified (or new)
  if (this.isModified("bvn") && !this.hasDedicatedAccountNumber) {
    try {
      // Check if BVN already exists
      const existingAccount = await mongoose.models.Account?.findOne({
        bvn: { $ne: this.bvn }, // Exclude current document
        _id: { $ne: this._id },
      });

      if (existingAccount) {
        const error = new Error("BVN already in use");
        return next(error);
      }

      // Hash BVN
      this.bvn = await bcrypt.hash(this.bvn, 10);
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

// Create virtual account after initial save
AccountSchema.post("save", async (doc, next) => {
  try {
    // Only proceed if we haven't created a dedicated account yet
    if (!doc.hasDedicatedAccountNumber && doc.bvn) {
      const user = await findUserByEmail(doc.user, {
        includePassword: false,
        throwOn404: true,
      });

      const tx_ref = new mongoose.Types.ObjectId().toString();
      const note = `Please use this account to fund your ${configs.appName} Account`;

      const account = await createVirtualAccount(
        user?.auth.email!,
        tx_ref,
        true,
        undefined,
        doc.bvn, // Note: BVN is already hashed at this point
        note
      );

      if (!account) {
        const error = new Error("Unable to create virtual account");
        return next(error);
      }

      // Update account details without triggering the save hook again
      await mongoose.models.Account.findByIdAndUpdate(
        doc._id,
        {
          accountDetails: {
            accountName: `${configs.appName} - ${user?.fullName}`,
            accountNumber: account.account_number,
            bankName: account.bank_name,
            bankCode: "N/A",
            accountRef: tx_ref,
            expirationDate: account.expiry_date,
          },
          hasDedicatedAccountNumber: true,
          order_ref: account.order_ref,
          flw_ref: account.flw_ref,
        },
        { new: true }
      );
    }
    next();
  } catch (error) {
    console.error("Error creating virtual account:", error);
    next(error as Error);
  }
});

const Account: mongoose.Model<dedicatedAccountNumber> =
  mongoose.models.Account || mongoose.model("Account", AccountSchema);

export { Account };
