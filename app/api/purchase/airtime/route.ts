import { App } from "@/models/app";
import { User } from "@/models/users";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { buyAirtime, httpStatusResponse } from "@/lib/utils";
import { airtimeRequestSchema } from "@/lib/validator.schema";
import { connectToDatabase } from "@/lib/connect-to-db";
import { transaction } from "@/types";
import { Transaction } from "@/models/transactions";
import { addToRecentlyUsedContact } from "@/models/recently-used-contact";
import { networkTypes } from "@/lib/constants";

/**
 * Buy airtime for a phone number
 *
 * @route POST /api/airtime
 * @access Private - Requires authentication
 */
export async function POST(request: Request) {
  // Start a MongoDB session for transaction
  let session: null | mongoose.ClientSession = null;

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

    // Connect to database BEFORE starting the session
    await connectToDatabase();

    // Start MongoDB session
    session = await mongoose.startSession();
    session.startTransaction();

    const app = await App.findOne({}).session(session);

    await app?.systemIsunderMaintainance();

    // Check if airtime transactions are enabled
    await app?.isTransactionEnable("airtime");

    await app?.checkTransactionLimit(amount);

    // Find user and verify transaction pin and balance
    const user = await User.findOne({
      "auth.email": authSession.user.email,
    })
      .select("+auth.transactionPin")
      .session(session);

    if (!user) {
      await session.abortTransaction();
      await session.endSession();
      return NextResponse.json(httpStatusResponse(404, "User not found"), {
        status: 404,
      });
    }

    await user.verifyTransactionPin(pin);

    await user.verifyUserBalance(amount);

    // Generate transaction reference
    const tx_ref = new mongoose.Types.ObjectId().toString();

    //Use this util function to purchase airtime
    const res = await buyAirtime(
      networkTypes[network],
      phoneNumber,
      amount,
      tx_ref,
      byPassValidator,
      "VTU"
    );

    if (res.status === "fail") {
      throw new Error(res.message || "Failed to purchase airtime");
    }

    // Create transaction record
    const trxPayload: transaction = {
      accountId: res["request-id"],
      amount,
      note: res.message,
      paymentMethod: "ownAccount",
      status: "success",
      tx_ref,
      type: "airtime",
      user: user.id,
      meta: {
        network,
        phoneNumber,
      },
    };

    const transaction = new Transaction(trxPayload);

    // Update user balance with session
    await user
      .updateOne({ $inc: { balance: -amount } }, { session })
      .then(async () => {
        await transaction.save({ session });
        await addToRecentlyUsedContact(
          phoneNumber,
          "airtime",
          { user: user.id, ...res },
          session
        );
      });

    // Commit the transaction if everything succeeded
    await session.commitTransaction();
    await session.endSession();

    return NextResponse.json(
      httpStatusResponse(200, "Airtime purchase successful", {}),
      { status: 200 }
    );
  } catch (error) {
    // Rollback transaction on error
    if (session) {
      console.log(session);
      await session.abortTransaction();
      await session.endSession();
    }

    console.error("Airtime purchase error:", error);

    const statusCode = (error as Error).message.includes("Unauthorized")
      ? 401
      : 500;
    return NextResponse.json(
      httpStatusResponse(statusCode, (error as Error).message),
      {
        status: statusCode,
      }
    );
  }
}
