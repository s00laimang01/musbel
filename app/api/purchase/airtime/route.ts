import { App } from "@/models/app";
import { User } from "@/models/users";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { httpStatusResponse } from "@/lib/utils";
import { airtimeRequestSchema } from "@/lib/validator.schema";
import { connectToDatabase } from "@/lib/connect-to-db";
import { BuyVTU } from "@/lib/server-utils";
import { Transaction } from "@/models/transactions"; // Add this import
import { z } from "zod";

// Add idempotency to the schema
const airtimeRequestSchemaWithIdempotency = airtimeRequestSchema.extend({
  idempotencyKey: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  let isTransactionCommitted = false;
  let user: any = null;

  // Start a MongoDB session for transaction
  const buyVtu = new BuyVTU(undefined, {
    validatePhoneNumber: body.byPassValidator ?? false,
    network: body.network,
    phoneNumber: body.phoneNumber,
  });

  try {
    const validationResult =
      airtimeRequestSchemaWithIdempotency.safeParse(body);

    // If the validation process was not successful
    if (!validationResult.success) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "INVALID_AIRTIME_REQUEST: The format of your request is invalid",
          validationResult.error.format()
        ),
        { status: 400 }
      );
    }

    // Get the data from the successfully parsed data
    const {
      pin,
      amount,
      network,
      phoneNumber,
      byPassValidator = false,
      idempotencyKey,
    } = validationResult.data;

    // Get user session
    const authSession = await getServerSession();

    // If the user is not authenticated
    if (!authSession?.user?.email) {
      return NextResponse.json(
        httpStatusResponse(401, "Unauthorized: Please login"),
        { status: 401 }
      );
    }

    // Connect to database BEFORE starting the session
    await connectToDatabase();

    // Find user first for validation and idempotency check
    user = await User.findOne({
      "auth.email": authSession.user.email,
    }).select("+auth.transactionPin");

    if (!user) {
      return NextResponse.json(httpStatusResponse(404, "User not found"), {
        status: 404,
      });
    }

    // Check for existing transaction with same idempotency key (if provided)
    if (idempotencyKey) {
      const existingTransaction = await Transaction.findOne({
        user: user._id,
        "meta.idempotencyKey": idempotencyKey,
        type: "airtime",
        createdAt: {
          $gte: new Date(Date.now() - 10 * 60 * 1000), // Within last 10 minutes
        },
      });

      if (existingTransaction) {
        // Return the existing transaction result
        return NextResponse.json(
          httpStatusResponse(
            200,
            "Transaction already processed",
            existingTransaction.meta
          ),
          { status: 200 }
        );
      }
    }

    // Verify the user transaction pin
    await user.verifyTransactionPin(pin);

    // Verify user has sufficient balance
    await user.verifyUserBalance(amount);

    // Start the session to avoid partial update on the DB
    await buyVtu.startSession();

    // Get the app config
    const app = await App.findOne({})
      .select("+buyVtu")
      .session(buyVtu?.session);

    const accessToken = await app?.refreshAccessToken();
    buyVtu.setAccessToken = accessToken!;
    buyVtu.setNetwork = network as any;

    await app?.systemIsunderMaintainance();
    await app?.isTransactionEnable("airtime");
    await app?.checkTransactionLimit(amount);

    const ntwks: Record<string, number> = {
      Mtn: 1,
      Airtel: 2,
      Glo: 3,
      "9Mobile": 4,
    };

    // Update user balance with session
    await user.updateOne(
      { $inc: { balance: -amount } },
      { session: buyVtu.session }
    );

    // Create a unique reference for this transaction
    const transactionRef = buyVtu.ref;

    // Set amount for transaction
    buyVtu.amount = amount;

    // Pre-create transaction with pending status
    await buyVtu.createPendingTransaction("airtime", user.id, {
      network,
      payerNumber: user.phoneNumber,
      payerName: user.fullName,
      customerPhone: phoneNumber,
      amount: amount,
      idempotencyKey: idempotencyKey,
      transactionRef: transactionRef,
    });

    // Commit the balance deduction and pending transaction
    await buyVtu.commitSession();
    isTransactionCommitted = true;

    // Now make external API calls AFTER committing the transaction
    let vendingSuccess = false;
    let vendingMessage = "";

    try {
      // Use the buyAirtime function to purchase airtime
      await buyVtu.buyAirtimeFromA4bData({
        amount,
        bypass: byPassValidator,
        network: String(ntwks[network]),
        phone: phoneNumber,
        "request-id": buyVtu.ref,
      });

      vendingSuccess = buyVtu.status;
      vendingMessage = buyVtu.message || "";
    } catch (vendingError) {
      console.error("External airtime vending API error:", vendingError);
      vendingSuccess = false;
      vendingMessage =
        vendingError instanceof Error
          ? vendingError.message
          : "Airtime vending failed";
    }

    // Update transaction status based on vending result
    await buyVtu.updateTransactionStatus(vendingSuccess, vendingMessage);

    if (!vendingSuccess) {
      // If vending failed, log the issue
      console.warn(
        `Airtime vending failed for transaction ${transactionRef}: ${vendingMessage}`
      );

      // Optionally refund user (uncomment if needed):
      // await user.updateOne({ $inc: { balance: amount } });
    }

    return NextResponse.json(
      httpStatusResponse(
        200,
        vendingSuccess
          ? buyVtu.message || "Airtime purchase successful"
          : "Transaction processed, but airtime delivery may be pending. Contact support if airtime is not received.",
        {
          ...buyVtu.vendingResponse,
          transactionRef: transactionRef,
          vendingSuccess: vendingSuccess,
        }
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error("Airtime purchase error:", error);

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
