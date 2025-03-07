import { configs } from "@/lib/constants";
import { httpStatusResponse, verifyTransaction } from "@/lib/utils";
import { Transaction } from "@/models/transactions";
import { User } from "@/models/users";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import type { flutterwaveWebhook, transaction } from "@/types";
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

  try {
    session.startTransaction();

    // Verify webhook signature
    const signature = request.headers.get("verif-hash");
    if (!verifySignature(signature, configs.FLW_SECRET_HASH!)) {
      return NextResponse.json(
        httpStatusResponse(401, "Unauthorized: Invalid signature"),
        { status: 401 }
      );
    }

    // Parse and validate webhook payload
    let payload;
    try {
      const body = await request.json();
      payload = body.data as flutterwaveWebhook["data"];
      if (!payload || !payload.id) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(httpStatusResponse(400, "Invalid payload"), {
          status: 400,
        });
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(400, "Invalid JSON payload"),
        {
          status: 400,
        }
      );
    }

    // Verify transaction with Flutterwave
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

    // Check if transaction is already processed
    if (transaction.status === "success") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(200, "Transaction already processed"),
        { status: 200 }
      );
    }

    // Handle failed payment
    if (trx.status === "failed") {
      transaction.status = "failed";
      await transaction.save({ session, validateBeforeSave: true });
      await session.commitTransaction();
      session.endSession();
      return NextResponse.json(httpStatusResponse(200, "Payment failed"), {
        status: 200,
      });
    }

    // Validate currency
    if (trx.currency !== "NGN") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(400, "Currency not supported"),
        { status: 400 }
      );
    }

    // Validate amount
    if (trx.amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(httpStatusResponse(400, "Invalid amount"), {
        status: 400,
      });
    }

    // Handle email-based account funding
    if (trx.customer.email) {
      // If the customer has an email, check to see if the email exists on this platform
      // and if yes fund the user account after success checks.
      try {
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

          const newTransaction = new Transaction(p);
          user.balance += trx.amount;

          await Promise.all([
            newTransaction.save({ session }),
            user.save({ session }),
          ]);

          await session.commitTransaction();
          session.endSession();

          return NextResponse.json(
            httpStatusResponse(200, "Payment successfully processed"),
            { status: 200 }
          );
        }
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error processing email-based account:", error);
        return NextResponse.json(
          httpStatusResponse(500, "An internal error occurred"),
          { status: 500 }
        );
      }
    }

    // Find the user
    const user = await User.findById(transaction.user).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(httpStatusResponse(404, "User not found"), {
        status: 404,
      });
    }

    // Process the transaction based on type
    if (transaction.type === "funding") {
      // Verify amount matches expected transaction amount (if expected amount was set)
      if (transaction.amount > 0 && trx.amount !== transaction.amount) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(httpStatusResponse(400, "Amount mismatch"), {
          status: 400,
        });
      }

      // Update user balance
      user.balance += trx.amount;
      await user.save({ session, validateModifiedOnly: true });
    }

    // Update transaction details
    transaction.amount = trx.amount;
    transaction.status = "success";
    await transaction.save({ session, validateModifiedOnly: true });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Return success response
    return NextResponse.json(
      httpStatusResponse(200, "Payment successfully processed"),
      { status: 200 }
    );
  } catch (error) {
    // Ensure transaction is aborted on any error
    try {
      await session.abortTransaction();
    } catch (sessionError) {
      console.error("Error aborting transaction:", sessionError);
    } finally {
      session.endSession();
    }

    console.error("Webhook processing error:", error);
    return NextResponse.json(
      httpStatusResponse(500, "An internal error occurred"),
      { status: 500 }
    );
  }
}
