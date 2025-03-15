import { configs } from "@/lib/constants";
import { httpStatusResponse } from "@/lib/utils";
import { Account } from "@/models/account";
import { Transaction } from "@/models/transactions";
import { User } from "@/models/users";
import { BillStackWebhookPayload, transaction } from "@/types";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";

// Your secret key from the Wiaxy dashboard
const SECRET_KEY = process.env.BILL_STACK_SECRET_KEY!;

// Function to verify the Wiaxy webhook signature
function verifyWiaxySignature(request: NextRequest): boolean {
  // Get the signature from the header
  const receivedSignature = request.headers.get("x-wiaxy-signature");

  // If there's no signature header, reject the request
  if (!receivedSignature) {
    console.error("Missing x-wiaxy-signature header");
    return false;
  }

  // Generate the MD5 hash of your secret key
  const expectedSignature = crypto
    .createHash("md5")
    .update(SECRET_KEY)
    .digest("hex");

  // Compare the received signature with the expected one
  const isValid = receivedSignature === expectedSignature;

  return isValid;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  // First verify that the request is from Wiaxy
  if (!verifyWiaxySignature(request)) {
    return NextResponse.json(
      httpStatusResponse(401, "INVALID_SIGNATURE: Unauthorized request"),
      { status: 401 }
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction(); // Explicitly start the transaction

  try {
    const payload = (await request.json()) as BillStackWebhookPayload;

    if (payload.event !== "PAYMENT_NOTIFIFICATION") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(400, "INVALID_EVENT_TYPE: please contact admin"),
        { status: 400 }
      );
    }

    if (payload.data.type !== "RESERVED_ACCOUNT_TRANSACTION") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(
          400,
          "INVALID_TRANSACTION_TYPE: please contact admin"
        ),
        { status: 400 }
      );
    }

    const transaction = await Transaction.findOne({
      tx_ref: payload.data.reference,
    });

    if (transaction?.status === "success") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(
          400,
          "TRANSACTION_ALREADY_PROCESSED: please contact admin"
        ),
        { status: 400 }
      );
    }

    const account = await Account.findOne({
      user: payload.data.merchant_reference,
    });

    if (!account) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(400, "ACCOUNT_NOT_FOUND: please contact admin"),
        { status: 400 }
      );
    }

    const user = await User.findById(account.user);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(400, "USER_NOT_FOUND: please contact admin"),
        { status: 400 }
      );
    }

    const amountToFund = payload.data.amount;

    user.balance += amountToFund;
    const trxPayload: transaction = {
      accountId: payload.data.account.account_number,
      amount: amountToFund,
      meta: {
        ...payload.data.payer,
      },
      note: "",
      paymentMethod: "dedicatedAccount",
      status: "pending",
      tx_ref: payload.data.reference,
      type: "funding",
      user: user._id,
    };

    const newTransaction = new Transaction(trxPayload);

    await Promise.all([
      user.save({ session }),
      newTransaction.save({ session }),
    ]);

    await session.commitTransaction();
    session.endSession();

    try {
      const { data, error } = await resend.emails.send({
        from: `${configs.appName}`,
        to: user.auth.email,
        text: "",
        subject: "FUNDING SUCCESSFUL",
      });

      console.log({ data, error });
    } catch (error) {
      console.log("FAIL_TO_SEND_EMAIL: ", error);
    }

    return NextResponse.json(
      httpStatusResponse(
        200,
        "PAYMENT_RECEIVED_SUCCESSFULLY: User account will be creditted shortly."
      )
    );
  } catch (error) {
    // Check if session exists and has an active transaction before aborting
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.log("Error aborting transaction:", abortError);
      }
      session.endSession();
    }
    console.log(error);

    return NextResponse.json(
      httpStatusResponse(500, "INTERNAL_SERVER_ERROR: please contact admin"),
      { status: 500 }
    );
  }
}
