import { createOneTimeVirtualAccount } from "@/lib/server-utils";
import {
  createVirtualAccount,
  getAccountNumber,
  httpStatusResponse,
} from "@/lib/utils";
import { Transaction } from "@/models/transactions";
import { findUserByEmail } from "@/models/users";
import { transaction } from "@/types";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

// Constants
const TRANSACTION_EXPIRY_MINUTES = 30;
const TRANSACTION_TYPE = "funding";
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

    // Create a transaction refrence to be use to store the doc in the db and its unique
    const tx_ref = new mongoose.Types.ObjectId().toString();
    // Expiry time for the virtual Account number
    const now = new Date();

    now.setMinutes(now.getMinutes() + TRANSACTION_EXPIRY_MINUTES);

    // Create new one time virtual account
    const virtualAccount = await createOneTimeVirtualAccount({
      amount: amount + "",
      currency: "NGN",
      email: "s00laimang20@gmail.com",
      name: user?.fullName!,
      reference: tx_ref,
    });

    // Create new virtual account

    // If we are unable to create the virtual throe an error
    if (!virtualAccount.status) {
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
      virtualAccount?.data.account_number,
      tx_ref,
      {
        expirationTime: now.toISOString(),
        accountNumber: virtualAccount.data.account_number,
        accountName: virtualAccount.data.account_name,
        bankName: virtualAccount.data.bank_name,
      }
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
 * Creates a new transaction record in the database
 */
async function createTransactionRecord(
  userId: string,
  amount: number,
  accountId: string,
  txRef: string,
  meta?: any
) {
  const trxPayload: transaction = {
    amount,
    note: "Please make the payment to this account",
    paymentMethod: PAYMENT_METHOD,
    accountId,
    type: TRANSACTION_TYPE,
    tx_ref: txRef,
    user: userId,
    status: "pending",
    meta,
  };

  const transaction = new Transaction(trxPayload);

  return transaction.save({ validateBeforeSave: true });
}
