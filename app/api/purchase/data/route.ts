import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";

import { httpStatusResponse } from "@/lib/utils";
import { User } from "@/models/users";
import { DataPlan } from "@/models/data-plan";
import { dataRequestSchema } from "@/lib/validator.schema";
import { App } from "@/models/app";
import { connectToDatabase } from "@/lib/connect-to-db";
import { BuyVTU } from "@/lib/server-utils";

export async function POST(request: Request) {
  const buyVtu = new BuyVTU();

  try {
    const body = await request.json();
    const validationResult = dataRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "INVALID_DATA_REQUEST: The format of your request is invalid",
          validationResult.error.format()
        ),
        { status: 400 }
      );
    }

    const {
      pin,
      _id,
      phoneNumber,
      byPassValidator = false,
    } = validationResult.data;

    // Get the email of the current authenticated user
    const serverSession = await getServerSession();
    if (!serverSession?.user?.email) {
      throw new Error(
        "UNAUTHORIZED_REQUEST: Please login before you continue."
      );
    }

    await connectToDatabase();
    await buyVtu.startSession();

    // Get the entire application configuration
    const app = await App.findOne({}).select("+buyVtu").session(buyVtu.session);

    // Refresh/Retrieve the buyVtu accessToken
    const accessToken = await app?.refreshAccessToken();
    buyVtu.setAccessToken = accessToken!;

    await app?.systemIsunderMaintainance();
    await app?.isTransactionEnable("data");

    const userEmail = serverSession.user.email;

    // Find the current user in the db and also the transaction pin
    const user = await User.findOne({ "auth.email": userEmail }).select(
      "+auth.transactionPin"
    );

    if (!user) {
      throw new Error("USER_NOT_FOUND: please contact admin");
    }

    // Verify the user transaction pin
    await user?.verifyTransactionPin(pin);

    // Find data plan
    const dataPlan = await DataPlan.findById(_id).session(buyVtu.session);

    if (!dataPlan) {
      throw new Error("PLAN_NOT_FOUND: we cannot find this plan");
    }

    // Check the transaction limit
    await app?.checkTransactionLimit(dataPlan.amount);

    // Verify user has sufficient balance
    await user.verifyUserBalance(dataPlan.amount);

    //TODO: check network
    buyVtu.setNetwork = dataPlan.network;

    // Buy data
    if (dataPlan.provider === "smePlug") {
      const n: Record<string, any> = {
        mtn: "1",
        airtel: "2",
        "9mobile": "3",
        glo: "4",
      };

      await buyVtu.buyDataFromSMEPLUG(
        n[dataPlan.network.toLowerCase()],
        dataPlan.planId,
        phoneNumber,
        dataPlan.amount
      );
    } else {
      await buyVtu.buyData(dataPlan.planId + "", phoneNumber);
    }

    if (!buyVtu.status) {
      throw new Error(buyVtu.message || "Failed to purchase data");
    }

    // Update user balance and create transaction record
    await user.updateOne({ $inc: { balance: -dataPlan.amount } });
    await buyVtu.createTransaction("data", user.id);

    // Commit transaction
    await buyVtu.commitSession();

    // At this point transaction is committed but session is still open

    return NextResponse.json(
      httpStatusResponse(
        200,
        buyVtu.message || "Your data has been purchased successfully",
        buyVtu.vendingResponse
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error("Data purchase error:", error);

    // Determine appropriate status code
    const statusCode = error instanceof z.ZodError ? 400 : 500;
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(httpStatusResponse(statusCode, errorMessage), {
      status: statusCode,
    });
  } finally {
    // End session regardless of success or failure
    // This is now safe to call even after commitSession
    if (buyVtu.session) {
      await buyVtu.endSession();
    }
  }
}
