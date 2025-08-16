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
import { availableNetworks } from "@/types";

// Add idempotency to the schema
const airtimeRequestSchemaWithIdempotency = airtimeRequestSchema.extend({
  idempotencyKey: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  let isTransactionCommitted = false;
  let user: any = null;

  const buyVtu = new BuyVTU(undefined, {
    validatePhoneNumber: body.byPassValidator ?? false,
    network: body.network,
    phoneNumber: body.phoneNumber,
  });

  try {
    const validationResult =
      airtimeRequestSchemaWithIdempotency.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          validationResult.error.issues
            .map((issue) => `${issue.path}: ${issue.message}`)
            .join(" ,"),
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

    const COMMISSION = amount * 0.02;
    const AMOUNT = amount - COMMISSION;

    // Verify the user transaction pin
    await user.verifyTransactionPin(pin);

    // Verify user has sufficient balance
    await user.verifyUserBalance(AMOUNT);

    // Start the session to avoid partial update on the DB
    await buyVtu.startSession();

    // Get the app config
    const app = await App.findOne({})
      .select("+buyVtu")
      .session(buyVtu?.session);

    //const accessToken = await app?.refreshAccessToken();
    //buyVtu.setAccessToken = accessToken!;
    buyVtu.setNetwork = network as any;

    await app?.systemIsunderMaintainance();
    await app?.isTransactionEnable("airtime");
    await app?.checkTransactionLimit(AMOUNT);

    //const ntwks: Record<string, number> = {
    //  Mtn: 1,
    //  Airtel: 2,
    //  Glo: 3,
    //  "9Mobile": 4,
    //};

    // Update user balance with session
    await user.updateOne(
      { $inc: { balance: -AMOUNT } },
      { session: buyVtu.session }
    );

    // Create a unique reference for this transaction
    const transactionRef = buyVtu.createRequestIdForVtuPass();

    // Set amount for transaction
    buyVtu.amount = AMOUNT;

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
      await buyVtu.buyAirtimeFromVTPass({
        phone: phoneNumber,
        amount: amount,
        network: network.toLowerCase() as availableNetworks,
        request_id: transactionRef,
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

    return NextResponse.json(
      httpStatusResponse(
        vendingSuccess ? 200 : 400,
        vendingSuccess
          ? buyVtu.message || "Airtime purchase successful"
          : vendingMessage ||
              "Oops, something went wrong while purchasing airtime for you",

        {
          ...buyVtu.vendingResponse,
          transactionRef: transactionRef,
          vendingSuccess: vendingSuccess,
        }
      ),
      { status: vendingSuccess ? 200 : 400 }
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
