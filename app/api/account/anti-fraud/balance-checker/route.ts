import { connectToDatabase } from "@/lib/connect-to-db";
import { configs } from "@/lib/constants";
import { sendEmail } from "@/lib/server-utils";
import { httpStatusResponse } from "@/lib/utils";
import { Transaction } from "@/models/transactions";
import { User } from "@/models/users";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";

// Request validation schema
const balanceCheckSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  tx_ref: z.string().min(1, "Transaction reference is required"),
  oldBalance: z.number().min(0, "Old balance must be non-negative"),
  expectedNewBalance: z
    .number()
    .min(0, "Expected new balance must be non-negative"),
  signature: z.string().min(1, "Signature is required"),
  timestamp: z.number().optional(),
  idempotencyKey: z.string().min(1, "Idempotency key is required"),
});

type BalanceCheckRequest = z.infer<typeof balanceCheckSchema>;

// Verify cryptographic signature
function verifySignature(
  data: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    return false;
  }
}

// Check if request is within acceptable time window (5 minutes)
function isRequestTimely(timestamp?: number): boolean {
  if (!timestamp) return true; // Allow requests without timestamp for backward compatibility

  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  return Math.abs(now - timestamp) <= fiveMinutes;
}

export async function POST(request: NextRequest) {
  let requestData: BalanceCheckRequest;

  try {
    const body = await request.json();
    requestData = balanceCheckSchema.parse(body);
  } catch (error) {
    console.error("Invalid request data:", error);
    return NextResponse.json(httpStatusResponse(400, "Invalid request data"), {
      status: 400,
    });
  }

  const {
    userId,
    tx_ref,
    oldBalance,
    expectedNewBalance,
    signature,
    timestamp,
    idempotencyKey,
  } = requestData;

  try {
    // Verify timestamp
    if (!isRequestTimely(timestamp)) {
      return NextResponse.json(
        httpStatusResponse(401, "Request timestamp is too old"),
        { status: 401 }
      );
    }

    // Create signature payload
    const signaturePayload = `${userId}:${tx_ref}:${oldBalance}:${expectedNewBalance}:${
      timestamp || ""
    }:${idempotencyKey}`;

    // Verify signature
    if (
      !verifySignature(signaturePayload, signature, configs["X-RAPIDAPI-KEY"]!)
    ) {
      console.warn(`Unauthorized balance check attempt for user ${userId}`);
      return NextResponse.json(httpStatusResponse(401, "Invalid signature"), {
        status: 401,
      });
    }

    await connectToDatabase();

    // Check for idempotency - you might want to store processed requests in a cache/database
    // For now, we'll use a simple check based on the current state

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(httpStatusResponse(404, "User not found"), {
        status: 404,
      });
    }

    // Check if balance is already at expected value (idempotency check)
    if (user.balance === expectedNewBalance) {
      return NextResponse.json(
        httpStatusResponse(200, "Balance already at expected value"),
        { status: 200 }
      );
    }

    const transaction = await Transaction.findOne({ tx_ref, user: user._id });
    if (!transaction) {
      return NextResponse.json(
        httpStatusResponse(404, "Transaction not found"),
        { status: 404 }
      );
    }

    // Validate transaction state
    if (transaction.status === "failed") {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "Cannot process balance update for failed/cancelled transaction"
        ),
        { status: 400 }
      );
    }

    // Start database transaction for atomic operation
    const session = await User.startSession();

    try {
      await session.withTransaction(async () => {
        // Re-fetch user within transaction to ensure we have the latest data
        const currentUser = await User.findById(userId).session(session);
        if (!currentUser) {
          throw new Error("User not found in transaction");
        }

        // Verify the old balance matches current balance (consistency check)
        if (currentUser.balance !== oldBalance) {
          throw new Error(
            `Balance mismatch: expected ${oldBalance}, found ${currentUser.balance}`
          );
        }

        // Calculate new balance based on transaction type
        let newBalance: number;

        if (transaction.type === "data" || transaction.type === "airtime") {
          newBalance = currentUser.balance - Math.abs(transaction.amount);
        } else {
          // For other transaction types, trust the expectedNewBalance
          newBalance = expectedNewBalance;
        }

        // Ensure calculated balance matches expected balance (within a small tolerance for floating point)
        const tolerance = 0.01; // 1 cent tolerance
        if (Math.abs(newBalance - expectedNewBalance) > tolerance) {
          throw new Error(
            `Balance calculation mismatch: calculated ${newBalance}, expected ${expectedNewBalance}`
          );
        }

        // Prevent negative balances unless explicitly allowed
        if (newBalance < 0) {
          throw new Error("Insufficient funds: balance cannot go negative");
        }

        // Update user balance
        currentUser.balance = expectedNewBalance;

        await currentUser.save({ session, validateModifiedOnly: true });

        // Update transaction status if needed
        if (transaction.status === "pending") {
          transaction.status = "success";
          transaction.createdAt = new Date().toISOString();
          await transaction.save({ session });
        }

        // Log the balance update for audit trail
        console.log(
          `Balance updated for user ${userId}: ${oldBalance} -> ${expectedNewBalance}`
        );
      });

      await session.endSession();

      return NextResponse.json(
        httpStatusResponse(200, "User balance updated successfully"),
        { status: 200 }
      );
    } catch (transactionError: any) {
      await session.endSession();

      console.error("Balance update transaction failed:", transactionError);

      // Send notification email for failed balance updates
      await sendEmail(
        ["suleimaangee@gmail.com"],
        `Balance update failed for user ${userId}: ${transactionError.message}`,
        `Balance Update Failed - User ${userId}`
      );

      return NextResponse.json(
        httpStatusResponse(500, "Failed to update balance"),
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Balance checker error:", error);

    // Send notification email for unexpected errors
    await sendEmail(
      ["suleimaangee@gmail.com"],
      `Unexpected error in balance checker for user ${userId}: ${error.message}`,
      `Balance Checker Error - User ${userId}`
    );

    return NextResponse.json(httpStatusResponse(500, "Internal server error"), {
      status: 500,
    });
  }
}
