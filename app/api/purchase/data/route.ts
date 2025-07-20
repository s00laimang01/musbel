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
import { IBuyVtuNetworks } from "@/types";

export async function POST(request: Request) {
  const buyVtu = new BuyVTU();
  let isTransactionCommitted = false;

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

    // Update user balance with session
    await user.updateOne(
      { $inc: { balance: -dataPlan.amount } },
      { session: buyVtu.session }
    );

    if (dataPlan.network === "Mtn" || dataPlan.provider === "smePlug") {
      //use abanty data sme
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
    }

    if (dataPlan.network !== "Mtn" || dataPlan.provider === "buyVTU") {
      const networdId: Record<IBuyVtuNetworks, string> = {
        Mtn: "1",
        Airtel: "2",
        Glo: "3",
        "9Mobile": "4",
      };

      await buyVtu.buyDataFromA4BData(
        networdId[dataPlan.network],
        String(dataPlan.planId),
        phoneNumber,
        byPassValidator
      );
    }

    buyVtu.amount = dataPlan?.amount;

    // Create transaction record
    await buyVtu.createTransaction("data", user.id, {
      ...dataPlan?.toJSON(),
      payerName: user.fullName,
      completionTime: new Date().toISOString(),
      customerPhone: phoneNumber,
      applicableCountry: "NG",
    });

    // Check if transaction creation was successful
    if (!buyVtu.status) {
      throw new Error(buyVtu.message || "Failed to create transaction record");
    }

    // Commit the transaction (this makes all changes permanent)
    await buyVtu.commitSession();
    isTransactionCommitted = true;

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

    // If transaction hasn't been committed and we have an active session, abort it
    if (!isTransactionCommitted && buyVtu.session) {
      try {
        await buyVtu.abortSession();
      } catch (abortError) {
        console.error("Error aborting transaction:", abortError);
      }
    }

    // Determine appropriate status code
    const statusCode = error instanceof z.ZodError ? 400 : 500;
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(httpStatusResponse(statusCode, errorMessage), {
      status: statusCode,
    });
  } finally {
    // Clean up session
    if (buyVtu.session) {
      try {
        await buyVtu.endSession();
      } catch (endError) {
        console.error("Error ending session:", endError);
      }
    }
  }
}
