import { App } from "@/models/app";
import { User } from "@/models/users";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { httpStatusResponse } from "@/lib/utils";
import { airtimeRequestSchema } from "@/lib/validator.schema";
import { processAirtimePurchase } from "@/lib/server-utils";
import { connectToDatabase } from "@/lib/connect-to-db";

/**
 * Buy airtime for a phone number
 *
 * @route POST /api/airtime
 * @access Private - Requires authentication
 */
export async function POST(request: Request) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = airtimeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "Invalid request data",
          validationResult.error.format()
        ),
        {
          status: 400,
        }
      );
    }

    const { pin, amount, network, phoneNumber, byPassValidator } =
      validationResult.data;

    // Get user session
    const authSession = await getServerSession();
    if (!authSession?.user?.email) {
      return NextResponse.json(
        httpStatusResponse(401, "Unauthorized: Please login"),
        { status: 401 }
      );
    }

    await connectToDatabase();

    const app = await App.findOne({});

    await app?.systemIsunderMaintainance();

    // Check if airtime transactions are enabled
    await app?.isTransactionEnable("airtime");

    await app?.checkTransactionLimit(amount);

    // Find user and verify transaction pin and balance
    const user = await User.findOne({
      "auth.email": authSession.user.email,
    })
      .session(session)
      .select("+auth.transactionPin");

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(httpStatusResponse(404, "User not found"), {
        status: 404,
      });
    }

    await user.verifyTransactionPin(pin);

    await user.verifyUserBalance(amount);

    // Generate transaction reference
    const tx_ref = new mongoose.Types.ObjectId().toString();

    try {
      // Process the airtime purchase
      const result = await processAirtimePurchase(
        user,
        network,
        phoneNumber,
        amount,
        tx_ref,
        byPassValidator,
        session
      );

      // Commit transaction and return success response
      await session.commitTransaction();
      session.endSession();

      return NextResponse.json(
        httpStatusResponse(200, "Airtime purchase successful", result),
        { status: 200 }
      );
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      return NextResponse.json(
        httpStatusResponse(400, (error as Error).message),
        { status: 400 }
      );
    }
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error("Airtime purchase error:", error);

    // Handle different types of errors
    if (error instanceof mongoose.Error) {
      return NextResponse.json(
        httpStatusResponse(500, "Database error", { message: error.message }),
        { status: 500 }
      );
    }

    if (error instanceof Error) {
      const statusCode = error.message.includes("Unauthorized") ? 401 : 500;
      return NextResponse.json(httpStatusResponse(statusCode, error.message), {
        status: statusCode,
      });
    }

    return NextResponse.json(
      httpStatusResponse(500, "An unexpected error occurred"),
      { status: 500 }
    );
  }
}
