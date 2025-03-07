import { configs } from "@/lib/constants";
import { httpStatusResponse, verifyTransaction } from "@/lib/utils";
import { Transaction } from "@/models/transactions";
import { User } from "@/models/users";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { flutterwaveWebhook, transaction } from "@/types";
import { Account } from "@/models/account";
import mongoose from "mongoose";

/**
 * Securely verifies the webhook signature using constant-time comparison
 * to prevent timing attacks
 */
function verifySignature(
  signature: string | null,
  expectedSignature: string
): boolean {
  if (!signature) return false;

  try {
    // Convert strings to buffers for constant-time comparison
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    // Return false if lengths don't match (prevents errors in timingSafeEqual)
    if (signatureBuffer.length !== expectedBuffer.length) return false;

    // Use timing-safe comparison to prevent timing attacks
    return timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Handles Flutterwave webhook requests for payment processing
 */
export async function POST(request: Request) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Verify webhook signature
    const signature = request.headers.get("verif-hash");
    if (!verifySignature(signature, configs.FLW_SECRET_HASH!)) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(401, "Unauthorized: Invalid signature"),
        { status: 401 }
      );
    }

    // Parse and validate trx
    const { data: payload } = (await request.json()) as flutterwaveWebhook;

    const trx = await verifyTransaction(payload.id);

    if (!trx) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(httpStatusResponse(400, "Invalid transaction"), {
        status: 400,
      });
    }

    if (!trx.tx_ref) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(400, "Bad request: Missing transaction reference"),
        { status: 400 }
      );
    }

    // Find the transaction
    const transaction = await Transaction.findOne({
      tx_ref: trx.tx_ref,
    }).session(session);

    if (!transaction) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(404, "Transaction not found"),
        { status: 404 }
      );
    }

    // Handle failed payment
    if (trx.status === "failed") {
      await session.abortTransaction();
      session.endSession();
      transaction.status = "failed";
      await transaction.save({ validateBeforeSave: true });
      return NextResponse.json(httpStatusResponse(200, "Payment failed"), {
        status: 200,
      });
    }

    // Check if transaction is already processed
    if (transaction.status === "success") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(200, "Transaction already processed"),
        { status: 200 }
      );
    }

    // Validate currency
    if (trx.currency !== "NGN") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(200, "Currency not supported"),
        { status: 200 }
      );
    }

    if (trx.customer.email) {
      // If the customer has an email, check to see if the email exist on this platform and if yes fund the user account after success checks.

      const [user, account] = await Promise.all([
        User.findOne({ "auth.email": trx.customer.email }).session(session),
        Account.findOne({ user: trx.customer.email }).session(session),
      ]);

      if (account && user) {
        // We found the user account
        const p: transaction = {
          accountId: trx.id,
          amount: trx.amount,
          note: trx.narration || "Account funding via dedicated account",
          paymentMethod: "dedicatedAccount",
          status: "success",
          tx_ref: trx.tx_ref,
          type: "funding",
          user: account.user,
        };

        const transaction = new Transaction(p);
        user.balance += trx.amount;

        await Promise.all([
          await transaction.save({ session }),
          await user.save({ session }),
        ]);

        await session.commitTransaction();
        session.endSession();

        return NextResponse.json(
          httpStatusResponse(200, "Payment successfully processed"),
          { status: 200 }
        );
      }
    }

    // Find the user
    const user = await User.findById(transaction.user);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(httpStatusResponse(200, "User not found"), {
        status: 200,
      });
    }

    // Process the transaction based on type
    if (transaction.type === "funding" && trx.amount > 0) {
      // Update user balance
      user.balance += trx.amount;
      await user.save({ validateModifiedOnly: true });
    }

    // Update transaction details
    transaction.amount = trx.amount;
    transaction.status = "success";
    await transaction.save({ validateModifiedOnly: true });

    // Return success response
    return NextResponse.json(
      httpStatusResponse(200, "Payment successfully processed"),
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
