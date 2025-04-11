import { connectToDatabase } from "@/lib/connect-to-db";
import { BuyVTU } from "@/lib/server-utils";
import { httpStatusResponse } from "@/lib/utils";
import { billPaymentSchema } from "@/lib/validator.schema";
import { App } from "@/models/app";
import { Electricity } from "@/models/electricity";
import { User } from "@/models/users";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const buyVtu = new BuyVTU();

  try {
    // Parse and validate request body
    const requestBody = await request.json();
    const validatedData = billPaymentSchema.safeParse(requestBody);

    if (!validatedData.success) {
      await buyVtu.endSession();
      return NextResponse.json(
        httpStatusResponse(400, validatedData.error.message),
        { status: 400 }
      );
    }

    const { electricityId, meterNumber, amount, pin, byPassValidator } =
      validatedData.data;

    await connectToDatabase();

    await buyVtu.startSession();

    const electricity = await Electricity.findById(electricityId);

    if (!electricity) {
      await buyVtu.endSession();
      return NextResponse.json(
        httpStatusResponse(404, "Electricity not found"),
        { status: 404 }
      );
    }

    const app = await App.findOne({}).select("+buyVtu").session(buyVtu.session);

    const accessToken = await app?.refreshAccessToken();

    buyVtu.setAccessToken = accessToken!;

    await app?.systemIsunderMaintainance();

    // Get user session
    const _session = await getServerSession();
    if (!_session?.user?.email) {
      await buyVtu.endSession();
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
      await buyVtu.endSession();
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
    //const tx_ref = new mongoose.Types.ObjectId().toString();

    //// Process bill payment
    //const res = await billPayment({
    //  disco: Number(electricity),
    //  meter_type: meterType,
    //  amount,
    //  bypass: byPassValidator,
    //  meter_number: Number(meterNumber),
    //  "request-id": tx_ref,
    //});

    await buyVtu.buyPower({
      amount,
      discoId: electricity.discoId,
      meterNo: meterNumber,
    });

    if (!buyVtu.status) {
      await buyVtu.endSession();
      return NextResponse.json(
        httpStatusResponse(
          400,
          buyVtu.message || "Something went wrong while processing your request"
        ),
        {
          status: 400,
        }
      );
    }

    // Update user balance
    await user.updateOne({ $inc: { balance: -amount } });

    // Create transaction record
    await buyVtu.createTransaction("bill", user.id);

    // Commit transaction
    await buyVtu.commitSession();

    return NextResponse.json(
      httpStatusResponse(
        200,
        buyVtu.message || "Your request has been proccess successfully",
        buyVtu.powerVendResponse
      ),
      {
        status: 200,
      }
    );
  } catch (error) {
    // Rollback transaction on error
    await buyVtu.endSession();

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
