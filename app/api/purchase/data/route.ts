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
import { dataPlan, IBuyVtuNetworks } from "@/types";
import { format } from "date-fns";
import { Transaction } from "@/models/transactions"; // Add this import

// Add a new schema for idempotency
const dataRequestSchemaWithIdempotency = dataRequestSchema.extend({
  idempotencyKey: z.string(),
});

export async function POST(request: Request) {
  const buyVtu = new BuyVTU();
  let isTransactionCommitted = false;
  let user: any = null;
  let dataPlan: dataPlan | null = null;

  try {
    const body = await request.json();
    const validationResult = dataRequestSchemaWithIdempotency.safeParse(body);

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
      idempotencyKey,
    } = validationResult.data;

    // Get the email of the current authenticated user
    const serverSession = await getServerSession();
    if (!serverSession?.user?.email) {
      throw new Error(
        "UNAUTHORIZED_REQUEST: Please login before you continue."
      );
    }

    await connectToDatabase();

    const userEmail = serverSession.user.email;

    // Find the current user in the db
    user = await User.findOne({ "auth.email": userEmail }).select(
      "+auth.transactionPin"
    );

    if (!user) {
      throw new Error("USER_NOT_FOUND: please contact admin");
    }

    // Check for existing transaction with same idempotency key (if provided)
    if (idempotencyKey) {
      const existingTransaction = await Transaction.findOne({
        user: user._id,
        "meta.idempotencyKey": idempotencyKey,
        type: "data",
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
    await user?.verifyTransactionPin(pin);

    // Find data plan
    dataPlan = await DataPlan.findById(_id);

    if (!dataPlan) {
      throw new Error("PLAN_NOT_FOUND: we cannot find this plan");
    }

    // Start session after all validations
    await buyVtu.startSession();

    // Get the entire application configuration
    const app = await App.findOne({}).select("+buyVtu").session(buyVtu.session);

    // Refresh/Retrieve the buyVtu accessToken
    const accessToken = await app?.refreshAccessToken();
    buyVtu.setAccessToken = accessToken!;

    await app?.systemIsunderMaintainance();
    await app?.isTransactionEnable("data");

    // Check the transaction limit
    await app?.checkTransactionLimit(dataPlan.amount);

    // Verify user has sufficient balance
    await user.verifyUserBalance(dataPlan.amount);

    // Set network
    buyVtu.setNetwork = dataPlan.network;

    // Create a unique reference for this transaction
    const transactionRef = buyVtu.ref;

    // Update user balance with session
    await user.updateOne(
      { $inc: { balance: -dataPlan.amount } },
      { session: buyVtu.session }
    );

    // Create transaction record BEFORE making external API calls
    buyVtu.amount = dataPlan?.amount;

    // Pre-create transaction with pending status
    await buyVtu.createPendingTransaction("data", user.id, {
      //@ts-ignore
      ...dataPlan?.toJSON(),
      payerName: user.fullName,
      completionTime: format(new Date(), "PPP"),
      customerPhone: phoneNumber,
      applicableCountry: "NG",
      idempotencyKey: idempotencyKey,
      transactionRef: transactionRef,
      phoneNumber,
    });

    // Commit the balance deduction and pending transaction
    await buyVtu.commitSession();
    isTransactionCommitted = true;

    // Now make external API calls AFTER committing the transaction
    let vendingSuccess = false;
    let vendingMessage = "";

    try {
      if (dataPlan.network === "Mtn" || dataPlan.provider === "smePlug") {
        // Use abanty data sme
        const n: Record<string, any> = {
          mtn: "1",
          airtel: "2",
          "9mobile": "3",
          glo: "4",
        };

        await buyVtu.buyDataFromSMEPLUG(
          n[dataPlan.network.toLowerCase()],
          dataPlan.planId as number,
          phoneNumber,
          dataPlan.amount
        );
      } else {
        const networdId: Record<IBuyVtuNetworks, string> = {
          Mtn: "1",
          Airtel: "airtel-data",
          Glo: "glo-data",
          "9Mobile": "etisalat-data",
        };

        await buyVtu.buyDataFromVtuPass({
          phone: phoneNumber,
          request_id: buyVtu.createRequestIdForVtuPass(),
          serviceID: networdId[dataPlan?.network!] as "airtel-data",
          variation_code: dataPlan?.planId + "",
        });
      }

      vendingSuccess = buyVtu.status;
      vendingMessage = buyVtu.message || "";
    } catch (vendingError) {
      console.error("External vending API error:", vendingError);
      vendingSuccess = false;
      vendingMessage =
        vendingError instanceof Error ? vendingError.message : "Vending failed";
    }

    // Update transaction status based on vending result
    await buyVtu.updateTransactionStatus(vendingSuccess, vendingMessage);

    if (!vendingSuccess) {
      // If vending failed, we might want to refund the user
      // But this is a business decision - some services keep the money for failed attempts
      console.warn(
        `Data vending failed for transaction ${transactionRef}: ${vendingMessage}`
      );

      // Optionally refund user (uncomment if needed):
      // await user.updateOne({ $inc: { balance: dataPlan.amount } });
    }

    return NextResponse.json(
      httpStatusResponse(
        200,
        vendingSuccess
          ? buyVtu.message || "Your data has been purchased successfully"
          : "Transaction processed, but data delivery may be pending. Contact support if data is not received.",
        {
          ...buyVtu.vendingResponse,
          transactionRef: transactionRef,
          vendingSuccess: vendingSuccess,
        }
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
