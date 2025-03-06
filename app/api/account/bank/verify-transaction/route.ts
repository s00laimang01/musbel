import { configs } from "@/lib/constants";
import { httpStatusResponse, verifyTransaction } from "@/lib/utils";
import { Transaction } from "@/models/transactions";
import { User } from "@/models/users";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { flutterwaveWebhook } from "@/types";

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
  try {
    // Verify webhook signature
    const signature = request.headers.get("verif-hash");
    if (!verifySignature(signature, configs.FLW_SECRET_HASH!)) {
      return NextResponse.json(
        httpStatusResponse(401, "Unauthorized: Invalid signature"),
        { status: 401 }
      );
    }

    // Parse and validate payload
    const payload = await request.json();

    console.log("Payload:", payload);

    if (!payload?.tx_ref) {
      return NextResponse.json(
        httpStatusResponse(400, "Bad request: Missing transaction reference"),
        { status: 400 }
      );
    }

    // Find the transaction
    const transaction = await Transaction.findOne({
      tx_ref: payload.tx_ref,
    });

    if (!transaction) {
      return NextResponse.json(
        httpStatusResponse(404, "Transaction not found"),
        { status: 404 }
      );
    }

    // Handle failed payment
    if (payload.status === "failed") {
      transaction.status = "failed";
      await transaction.save({ validateBeforeSave: true });
      return NextResponse.json(httpStatusResponse(200, "Payment failed"), {
        status: 200,
      });
    }

    const trx = await verifyTransaction(payload.id);

    if (!trx) {
      return NextResponse.json(httpStatusResponse(400, "Invalid transaction"), {
        status: 400,
      });
    }

    // Check if transaction is already processed
    if (transaction.status === "success") {
      return NextResponse.json(
        httpStatusResponse(200, "Transaction already processed"),
        { status: 200 }
      );
    }

    // Validate currency
    if (payload.currency !== "NGN") {
      return NextResponse.json(
        httpStatusResponse(200, "Currency not supported"),
        { status: 200 }
      );
    }

    // Find the user
    const user = await User.findById(transaction.user);
    if (!user) {
      return NextResponse.json(httpStatusResponse(200, "User not found"), {
        status: 200,
      });
    }

    // Process the transaction based on type
    if (transaction.type === "funding" && payload.amount > 0) {
      // Update user balance
      user.balance += payload.amount;
      await user.save({ validateBeforeSave: true });
    }

    // Update transaction details
    transaction.amount = payload.amount;
    transaction.status = "success";
    await transaction.save({ validateBeforeSave: true });

    // Return success response
    return NextResponse.json(
      httpStatusResponse(200, "Payment successfully processed"),
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
