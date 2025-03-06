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
              return !accountNumber || accountNumber.length >= 10;
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
      },
      user: { type: String, ref: "User", index: true, unique: true },
      hasDedicatedAccountNumber: { type: Boolean, default: false },
      order_ref: { type: String },
      flw_ref: { type: String },
    },
    { timestamps: true }
  );

// Validate BVN uniqueness before saving
AccountSchema.pre("validate", async function (next) {
  if (this.isModified("bvn") && !this.hasDedicatedAccountNumber) {
    try {
      // Check if BVN already exists (using hashed comparison)
      const existingAccount = await mongoose.models.Account?.findOne({
        _id: { $ne: this._id },
      });

      if (
        existingAccount &&
        (await bcrypt.compare(this.bvn, existingAccount.bvn))
      ) {
        return next(new Error("BVN already in use"));
      }

      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

// Hash BVN before saving
AccountSchema.pre("save", async function (next) {
  if (this.isModified("bvn") && !this.hasDedicatedAccountNumber) {
    try {
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
AccountSchema.post("save", async (doc) => {
  // Use a separate function to handle virtual account creation
  // to avoid blocking the save operation
  if (!doc.hasDedicatedAccountNumber && doc.bvn) {
    try {
      await createVirtualAccountForUser(doc);
    } catch (error) {
      console.error("Error creating virtual account:", error);
      // Don't throw here to avoid blocking the save operation
    }
  }
});

// Separate function to handle virtual account creation
async function createVirtualAccountForUser(doc: dedicatedAccountNumber) {
  try {
    const user = await findUserByEmail(doc.user, {
      includePassword: false,
      throwOn404: true,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const tx_ref = new mongoose.Types.ObjectId().toString();
    const note = `Please use this account to fund your ${configs.appName} Account`;

    // We don't need to pass the hashed BVN here - the createVirtualAccount function
    // should handle the raw BVN value from a secure source
    const account = await createVirtualAccount(
      user.auth.email!,
      tx_ref,
      true,
      undefined,
      doc.bvn, // This is already hashed
      note
    );

    if (!account) {
      throw new Error("Unable to create virtual account");
    }

    // Update account details without triggering the save hook again
    await mongoose.models.Account.findByIdAndUpdate(doc._id, {
      accountDetails: {
        accountName: `${configs.appName} - ${user.fullName}`,
        accountNumber: account.account_number,
        bankName: account.bank_name,
        bankCode: "N/A",
        accountRef: tx_ref,
        expirationDate: account.expiry_date,
      },
      hasDedicatedAccountNumber: true,
      order_ref: account.order_ref,
      flw_ref: account.flw_ref,
    });
  } catch (error) {
    console.error("Error in createVirtualAccountForUser:", error);
    throw error;
  }
}

// Create the model
const Account: mongoose.Model<dedicatedAccountNumber> =
  mongoose.models.Account || mongoose.model("Account", AccountSchema);

export { Account };
