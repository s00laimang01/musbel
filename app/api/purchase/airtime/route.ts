import { App } from "@/models/app";
import { User } from "@/models/users";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { httpStatusResponse } from "@/lib/utils";
import { airtimeRequestSchema } from "@/lib/validator.schema";
import { connectToDatabase } from "@/lib/connect-to-db";
import { BuyVTU } from "@/lib/server-utils";

export async function POST(request: Request) {
  const body = await request.json(); //Get the body of our request of the client

  // Start a MongoDB session for transaction
  const buyVtu = new BuyVTU(undefined, {
    validatePhoneNumber: body.byPassValidator ?? false,
    network: body.network,
    phoneNumber: body.phoneNumber,
  });

  try {
    const validationResult = airtimeRequestSchema.safeParse(body); //using zod validation to validate the data we want.

    //If the validation process was not successfull
    if (!validationResult.success) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "INVALID_DATA_REQUEST: The format of your request is invalid",
          validationResult.error.format()
        ),
        {
          status: 400,
        }
      );
    }

    //Get the data from the successfully parse data
    const {
      pin,
      amount,
      network,
      phoneNumber,
      byPassValidator = false,
    } = validationResult.data;

    // Get user session
    const authSession = await getServerSession();

    //If the user is not authenticated
    if (!authSession?.user?.email) {
      return NextResponse.json(
        httpStatusResponse(401, "Unauthorized: Please login"),
        { status: 401 }
      );
    }

    // Connect to database BEFORE starting the session
    await connectToDatabase();

    //Start the session to avoid partial update on the DB
    await buyVtu.startSession();

    //Get the app config
    const app = await App.findOne({})
      .select("+buyVtu")
      .session(buyVtu?.session);

    const accessToken = await app?.refreshAccessToken(); //This is use to refresh the accessToken use for the buyVTU api requests

    buyVtu.setAccessToken = accessToken!; //Set the accessToken to the updated or old accessToken

    buyVtu.setNetwork = network as any;

    await app?.systemIsunderMaintainance(); //Check to see if the system is under maintainance

    await app?.isTransactionEnable("airtime"); // Check if airtime transactions are enabled

    await app?.checkTransactionLimit(amount); //Check the transaction limit to see if the user request pass that amount.

    const ntwks: Record<string, number> = {
      Mtn: 1,
      Airtel: 2,
      Glo: 3,
      "9Mobile": 4,
    };

    // Find user and verify transaction pin and balance
    const user = await User.findOne({
      "auth.email": authSession.user.email,
    })
      .select("+auth.transactionPin")
      .session(buyVtu.session);

    if (!user) {
      await buyVtu.endSession();
      return NextResponse.json(httpStatusResponse(404, "User not found"), {
        status: 404,
      });
    }

    await user.verifyTransactionPin(pin); //Validate the user pin

    await user.verifyUserBalance(amount); //Check if the user have the balance to buy the service.

    // Update user balance with session
    await user.updateOne(
      { $inc: { balance: -amount } },
      { session: buyVtu.session }
    );

    //Use the buyAirtime function to purchase airtime.
    await buyVtu.buyAirtimeFromA4bData({
      amount,
      bypass: byPassValidator,
      network: String(ntwks[network]),
      phone: phoneNumber,
      "request-id": buyVtu.ref,
    });

    //If the service purchase is not successfull throw and error
    if (!buyVtu.status) {
      throw new Error(buyVtu.message || "Failed to purchase airtime");
    }

    // Create transaction record
    await buyVtu.createTransaction("airtime", user.id, {
      network,
      payerNumber: user.phoneNumber,
      payerName: user.fullName,
    });

    // Commit the transaction if everything succeeded
    await buyVtu.commitSession();

    return NextResponse.json(
      httpStatusResponse(
        200,
        buyVtu.message || "Airtime purchase successful",
        {}
      ),
      { status: 200 }
    );
  } catch (error) {
    if (buyVtu.session) {
      await buyVtu.endSession();
    }

    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      {
        status: 500,
      }
    );
  }
}
