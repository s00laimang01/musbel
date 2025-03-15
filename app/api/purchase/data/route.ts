import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { z } from "zod";

import { buyData, httpStatusResponse } from "@/lib/utils";
import {
  User,
  verifyUserBalance,
  verifyUserTransactionPin,
} from "@/models/users";
import { DataPlan } from "@/models/data-plan";
import { Transaction } from "@/models/transactions";
import { transaction } from "@/types";
import { addToRecentlyUsedContact } from "@/models/recently-used-contact";
import { networkTypes } from "@/lib/constants";

// Define a schema for request validation
const requestSchema = z.object({
  pin: z.string().min(4),
  _id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid plan ID format",
  }),
  phoneNumber: z.string(),
  byPassValidator: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  let session: mongoose.ClientSession | null = null;

  try {
    // Parse and validate request data
    const body = await request.json();
    const validatedData = requestSchema.parse(body);
    const { pin, _id, phoneNumber, byPassValidator = false } = validatedData;

    // Start transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Authenticate user
    const serverSession = await getServerSession();
    if (!serverSession?.user?.email) {
      throw new Error("Unauthorized access");
    }

    const userEmail = serverSession.user.email;
    const user = await User.findOne({
      "auth.email": userEmail,
    }).session(session);

    if (!user) {
      throw new Error("User not found");
    }

    // Verify transaction PIN
    await verifyUserTransactionPin(userEmail, pin);

    // Find data plan
    const dataPlan = await DataPlan.findById(_id).session(session);

    console.log({ dataPlan });

    if (!dataPlan) {
      throw new Error("Plan not found");
    }

    // Verify user has sufficient balance
    await verifyUserBalance(userEmail, dataPlan.amount);

    // Generate secure transaction reference
    const tx_ref = new mongoose.Types.ObjectId().toString();

    // Process data purchase
    const purchaseResult = await buyData(
      dataPlan.planId!,
      phoneNumber,
      tx_ref,
      networkTypes[dataPlan.network],
      byPassValidator
    );

    console.log({ purchaseResult });

    if (purchaseResult.status === "failed") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(
          400,
          "SOMETHING_WENT_WRONG: please contact the admin"
        ),
        { status: 400 }
      );
    }

    // Create transaction record
    const trxPayload: transaction = {
      accountId: dataPlan._id.toString(),
      amount: dataPlan.amount,
      note: purchaseResult.message,
      paymentMethod: "ownAccount",
      status:
        purchaseResult.status === "success"
          ? "success"
          : purchaseResult.status === "fail"
          ? "failed"
          : "pending",
      tx_ref,
      type: "data",
      user: user.id.toString(),
    };

    if (purchaseResult.status === "fail") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(400, purchaseResult.message),
        { status: 400 }
      );
    }

    // Update user balance
    user.balance -= dataPlan.amount;

    // Save changes
    const transaction = new Transaction(trxPayload);
    await Promise.all([
      user.save({ validateModifiedOnly: true, session }),
      transaction.save({ validateModifiedOnly: true, session }),
      addToRecentlyUsedContact(
        phoneNumber,
        "airtime",
        { network: dataPlan.network, user: user.id, plan: dataPlan.data },
        session
      ),
    ]);

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      httpStatusResponse(
        200,
        "Your data has been purchased successfully",
        purchaseResult
      ),
      {
        status: 200,
      }
    );
  } catch (error) {
    // Rollback transaction on error
    if (session) {
      await session.abortTransaction().catch(console.error);
    }

    // Determine appropriate status code
    const statusCode = error instanceof z.ZodError ? 400 : 500;
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(httpStatusResponse(statusCode, errorMessage), {
      status: statusCode,
    });
  } finally {
    // Always end session
    if (session) {
      session.endSession().catch(console.error);
    }
  }
}
