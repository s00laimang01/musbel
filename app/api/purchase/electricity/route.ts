import { connectToDatabase } from "@/lib/connect-to-db";
import { billPayment, httpStatusResponse } from "@/lib/utils";
import { billPaymentSchema } from "@/lib/validator.schema";
import { App } from "@/models/app";
import { addToRecentlyUsedContact } from "@/models/recently-used-contact";
import { Transaction } from "@/models/transactions";
import { User } from "@/models/users";
import type { transaction } from "@/types";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Parse and validate request body
    const requestBody = await request.json();
    const validatedData = billPaymentSchema.safeParse(requestBody);

    if (!validatedData.success) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(400, validatedData.error.message),
        { status: 400 }
      );
    }

    const {
      electricity,
      meterType,
      meterNumber,
      amount,
      pin,
      byPassValidator,
    } = validatedData.data;

    await connectToDatabase();

    const app = await App.findOne({});

    await app?.systemIsunderMaintainance();

    // Get user session
    const _session = await getServerSession();
    if (!_session?.user?.email) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(401, "Unauthorized: User not authenticated"),
        { status: 401 }
      );
    }

    // Find user
    const user = await User.findOne({
      "auth.email": _session.user.email,
    }).select("+auth.transactionPin");
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(httpStatusResponse(404, "User not found"), {
        status: 404,
      });
    }

    // Check if transaction type is enabled
    await app?.isTransactionEnable("bill");

    // Verify transaction PIN
    await user?.verifyTransactionPin(pin);

    // Check transaction limit
    await app?.checkTransactionLimit(amount);

    // Verify user balance
    await user?.verifyUserBalance(amount);

    // Generate transaction reference
    const tx_ref = new mongoose.Types.ObjectId().toString();

    // Process bill payment
    const res = await billPayment({
      disco: Number(electricity),
      meter_type: meterType,
      amount,
      bypass: byPassValidator,
      meter_number: Number(meterNumber),
      "request-id": tx_ref,
    });

    // Update user balance
    user.balance -= Number(amount);

    // Create transaction record
    const trxPayload: transaction = {
      accountId: res["request-id"],
      amount: Number(amount),
      meta: {
        ...res,
      },
      note: res.message,
      paymentMethod: "ownAccount",
      status: res.status === "success" ? "success" : "pending",
      tx_ref,
      type: "bill",
      user: user._id,
    };

    const transaction = new Transaction(trxPayload);

    // Save all changes in parallel
    await Promise.all([
      transaction.save({ session }),
      user.save({ session }),
      addToRecentlyUsedContact(
        meterNumber,
        "bill",
        { meterType, electricity },
        session
      ),
    ]);

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(httpStatusResponse(200, res.message), {
      status: 200,
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error("Bill payment error:", error);

    return NextResponse.json(
      httpStatusResponse(
        500,
        error instanceof Error ? error.message : "An unexpected error occurred"
      ),
      { status: 500 }
    );
  }
}
