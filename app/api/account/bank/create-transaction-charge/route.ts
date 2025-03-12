import {
  createVirtualAccount,
  getAccountNumber,
  httpStatusResponse,
} from "@/lib/utils";
import { Transaction } from "@/models/transactions";
import { findUserByEmail } from "@/models/users";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

// Constants
const TRANSACTION_EXPIRY_MINUTES = 60;
const TRANSACTION_TYPE = "funding";
const TRANSACTION_STATUS_PENDING = "pending";
const PAYMENT_METHOD = "virtualAccount";

// Input validation schema
const requestSchema = z.object({
  amount: z.number().positive("Amount must be a positive number"),
});

// Custom error types
class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

class ValidationError extends Error {
  constructor(message = "Invalid input data") {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Creates a virtual account for user funding
 *
 * @returns Virtual account details or existing account if a duplicate transaction is detected
 */
export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.message);
    }

    const { amount } = validationResult.data;

    // Get the user session
    const session = await getServerSession();

    // If the session does not contain an email address return for this request
    if (!session?.user?.email) {
      throw new AuthenticationError("User email not found in session");
    }

    // If the user using the email in the current session and throw404 if it does not exist
    const user = await findUserByEmail(session.user.email, {
      throwOn404: true,
      includePassword: false,
    });

    // Check for recent duplicate transactions -> The expiry time is 1hour
    const expiryThreshold = new Date();
    expiryThreshold.setMinutes(
      expiryThreshold.getMinutes() - TRANSACTION_EXPIRY_MINUTES
    );

    // Create a transaction refrence to be use to store the doc in the db and its unique
    const tx_ref = new mongoose.Types.ObjectId().toString();

    // Check if the user already has a pending transaction of the same amount, if yes use the transaction
    const duplicateTransaction = await findDuplicateTransaction(
      user?._id!,
      amount,
      expiryThreshold
    );

    // Return existing account details if duplicate transaction found
    if (duplicateTransaction) {
      const virtualAccount = await getAccountNumber(
        duplicateTransaction.accountId!
      );

      return NextResponse.json(
        httpStatusResponse(
          200,
          "Existing virtual account retrieved to prevent duplication",
          { ...virtualAccount, tx_ref }
        ),
        { status: 200 }
      );
    }

    // Create new virtual account
    const virtualAccount = await createVirtualAccount<{ user: string }>(
      user?.auth.email!,
      tx_ref,
      false,
      amount,
      undefined,
      "Please make the payment to this account.",
      {
        user: user?._id!,
      }
    );

    // If we are unable to create the virtual throe an error
    if (!virtualAccount) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "Unable to create virtual account, Please try again later"
        ),
        { status: 400 }
      );
    }

    // Record transaction in database with
    await createTransactionRecord(
      user?._id!,
      amount,
      virtualAccount?.order_ref!,
      tx_ref
    );

    return NextResponse.json(
      httpStatusResponse(200, "Virtual account created successfully", {
        ...virtualAccount,
        tx_ref,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    // Handle specific error types
    if (error instanceof AuthenticationError) {
      return NextResponse.json(httpStatusResponse(401, error.message), {
        status: 401,
      });
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(httpStatusResponse(400, error.message), {
        status: 400,
      });
    }

    // Generic error handling
    console.error("Virtual account creation error:", error);
    return NextResponse.json(
      httpStatusResponse(
        500,
        (error as Error).message || "An unexpected error occurred"
      ),
      {
        status: 500,
      }
    );
  }
}

/**
 * Finds a duplicate transaction for the same user and amount within the expiry threshold
 */
async function findDuplicateTransaction(
  userId: string,
  amount: number,
  expiryThreshold: Date
) {
  return Transaction.findOne({
    user: userId,
    type: TRANSACTION_TYPE,
    status: TRANSACTION_STATUS_PENDING,
    createdAt: { $gte: expiryThreshold },
    amount: { $eq: amount },
  });
}

/**
 * Creates a new transaction record in the database
 */
async function createTransactionRecord(
  userId: string,
  amount: number,
  accountId: string,
  txRef: string
) {
  const transaction = new Transaction({
    amount,
    note: "Please make the payment to this account",
    paymentMethod: PAYMENT_METHOD,
    accountId,
    type: TRANSACTION_TYPE,
    tx_ref: txRef,
    user: userId,
  });

  return transaction.save({ validateBeforeSave: true });
}
