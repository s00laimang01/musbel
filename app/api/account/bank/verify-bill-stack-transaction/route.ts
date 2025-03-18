import { formatCurrency, httpStatusResponse } from "@/lib/utils";
import { Account } from "@/models/account";
import { Transaction } from "@/models/transactions";
import { User } from "@/models/users";
import { BillStackWebhookPayload, transaction } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/connect-to-db";

// Your secret key from the Wiaxy dashboard

// Function to verify the Wiaxy webhook signature
function verifyWiaxySignature(request: NextRequest): boolean {
  try {
    const SECRET_KEY = process.env.BILL_STACK_SECRET_KEY!;

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
  } catch (error) {
    return false;
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    //   First verify that the request is from Wiaxy
    if (!verifyWiaxySignature(request)) {
      return NextResponse.json(
        httpStatusResponse(401, "INVALID_SIGNATURE: Unauthorized request"),
        { status: 401 }
      );
    }

    const payload = (await request.json()) as BillStackWebhookPayload;

    if (payload.event !== "PAYMENT_NOTIFICATION") {
      return NextResponse.json(
        httpStatusResponse(429, "INVALID_EVENT_TYPE: please contact admin"),
        { status: 429 }
      );
    }

    if (payload.data.type !== "RESERVED_ACCOUNT_TRANSACTION") {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "INVALID_TRANSACTION_TYPE: please contact admin"
        ),
        { status: 400 }
      );
    }

    await connectToDatabase();

    const transaction = await Transaction.findOne({
      tx_ref: payload.data.transaction_ref,
    });

    if (transaction?.status === "success") {
      return NextResponse.json(
        httpStatusResponse(
          409,
          "TRANSACTION_ALREADY_PROCESSED: please contact admin"
        ),
        { status: 409 }
      );
    }

    const account = await Account.findOne({
      user: payload.data.merchant_reference,
    });

    if (!account) {
      return NextResponse.json(
        httpStatusResponse(404, "ACCOUNT_NOT_FOUND: please contact admin"),
        { status: 404 }
      );
    }

    const user = await User.findById(account.user);

    if (!user) {
      return NextResponse.json(
        httpStatusResponse(404, "USER_NOT_FOUND: please contact admin"),
        { status: 404 }
      );
    }

    const fees = payload.data.amount * 0.01;
    const amountToFund = payload.data.amount - fees;

    user.balance += Number(amountToFund);

    const trxPayload: transaction = {
      accountId: payload.data.account.account_number,
      amount: amountToFund,
      meta: {
        ...payload.data.payer[0],
      },
      note: `Your account has been credited with ${formatCurrency(
        amountToFund,
        2
      )}`,
      paymentMethod: "dedicatedAccount",
      status: "success",
      tx_ref: payload.data.wiaxy_ref,
      type: "funding",
      user: user._id,
    };

    const newTransaction = new Transaction(trxPayload);

    await user.save({ validateModifiedOnly: true }).then(async () => {
      await newTransaction.save({ validateModifiedOnly: true });
    });

    return NextResponse.json(
      httpStatusResponse(
        200,
        "PAYMENT_RECEIVED_SUCCESSFULLY: User account will be creditted shortly."
      ),
      { status: 200 }
    );
  } catch (error) {
    // Check if session exists and has an active transaction before aborting

    console.log(error);

    return NextResponse.json(
      httpStatusResponse(500, "INTERNAL_SERVER_ERROR: please contact admin"),
      { status: 500 }
    );
  }
}
