import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { z } from "zod";

import { buyData, httpStatusResponse } from "@/lib/utils";
import { User } from "@/models/users";
import { DataPlan } from "@/models/data-plan";
import { Transaction } from "@/models/transactions";
import { transaction } from "@/types";
import { addToRecentlyUsedContact } from "@/models/recently-used-contact";
import { networkTypes } from "@/lib/constants";
import { dataRequestSchema } from "@/lib/validator.schema";
import { App } from "@/models/app";
import { connectToDatabase } from "@/lib/connect-to-db";

// Define a schema for request validation

export async function POST(request: Request) {
  let session: mongoose.ClientSession | null = null;

  try {
    // Parse and validate request data
    const body = await request.json();
    const validatedData = dataRequestSchema.parse(body);
    const { pin, _id, phoneNumber, byPassValidator = false } = validatedData;

    // Start transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Authenticate user
    const serverSession = await getServerSession();
    if (!serverSession?.user?.email) {
      throw new Error("Unauthorized access");
    }

    await connectToDatabase();

    const app = await App.findOne({});

    await app?.systemIsunderMaintainance();

    await app?.isTransactionEnable("data");

    const userEmail = serverSession.user.email;

    const user = await User.findOne({ "auth.email": userEmail }).select(
      "+auth.transactionPin"
    );

    await user?.verifyTransactionPin(pin);

    if (!user) {
      throw new Error("USER_NOT_FOUND: please contact admin");
    }

    // Find data plan
    const dataPlan = await DataPlan.findById(_id).session(session);

    if (!dataPlan) {
      throw new Error("Plan not found");
    }

    await app?.checkTransactionLimit(dataPlan.amount);

    // Verify user has sufficient balance
    await user.verifyUserBalance(dataPlan.amount);

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

    if (purchaseResult.status === "failed") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(400, purchaseResult.message),
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

    // Save changes
    const transaction = new Transaction(trxPayload);

    await user
      .updateOne({ $inc: { balance: -dataPlan.amount } })
      .then(async () => {
        await transaction.save({ validateModifiedOnly: true, session }),
          await addToRecentlyUsedContact(
            phoneNumber,
            "data",
            { user: user.id, plan: dataPlan.data, ...dataPlan.toObject() },
            session
          );
      });

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
    console.log(error);
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
