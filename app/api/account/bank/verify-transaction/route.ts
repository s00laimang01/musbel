import { verifyTransactionWithBudPay } from "@/lib/server-utils";
import { formatCurrency, httpStatusResponse } from "@/lib/utils";
import { Account } from "@/models/account";
import { Transaction } from "@/models/transactions";
import { User } from "@/models/users";
import { BudPayWebhookPayload, transaction } from "@/types";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

function verifyBudPayWebhook(
  secretKey: string,
  publicKey: string,
  webhookSignature: string
) {
  // Input validation
  if (!secretKey || !publicKey || !webhookSignature) {
    console.error("Missing required parameters for webhook verification");
    return false;
  }

  // Create merchant signature by hashing the public key with the secret key using HMAC-SHA512
  const merchantSignature = createHmac("sha512", secretKey)
    .update(publicKey)
    .digest("hex");

  // Convert hex strings to Buffer objects for timing-safe comparison
  const merchantBuffer = Buffer.from(merchantSignature, "hex");
  const webhookBuffer = Buffer.from(webhookSignature, "hex");

  // Check if the buffers have the same length
  if (merchantBuffer.length !== webhookBuffer.length) {
    console.log("Signature length mismatch - rejecting webhook");
    return false;
  }

  // Perform timing-safe comparison
  const isValid = timingSafeEqual(merchantBuffer, webhookBuffer);

  return isValid;
}

export async function POST(request: Request) {
  const session = await mongoose.startSession();
  const merchantsignature = request.headers.get("merchantsignature");

  try {
    const { data, notify, notifyType, transferDetails } =
      (await request.json()) as BudPayWebhookPayload;

    // TODO: First verify that the trx is from budPay
    const isWebHookSignatureValid = verifyBudPayWebhook(
      process.env.BUDPAY_SECRET_KEY!,
      process.env.BUDPAY_PUBLIC_KEY!,
      merchantsignature!
    );

    if (!isWebHookSignatureValid) {
      return NextResponse.json(httpStatusResponse(400, "Invalid signature"), {
        status: 400,
      });
    }

    session.startTransaction();

    if (notify !== "transaction") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(httpStatusResponse(400, "Invalid notify type"), {
        status: 400,
      });
    }

    if (notifyType !== "successful") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(
          400,
          "Aborting process, transaction is not yet marked as successful."
        )
      );
    }

    const { type, id, amount, customer } = data;

    if (isNaN(Number(amount))) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(httpStatusResponse(400, "Invalid amount"), {
        status: 400,
      });
    }

    const trx = await verifyTransactionWithBudPay(id + "");

    if (type === "dedicated_account") {
      // We know this is a user trying to fund their account using their dedicated account number
      const account = await Account.findOne({
        "accountDetails.accountRef": customer.customer_code,
        "accountDetails.accountNumber": transferDetails.craccount,
      });

      // Find the account related the user that makes the payment
      if (!account) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          httpStatusResponse(400, "Could not find account"),
          {
            status: 400,
          }
        );
      }

      // We found the account, now let's find the user
      const user = await User.findById(account.user);

      // If the user is not found throw a 404 error
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          httpStatusResponse(404, "Could not find user"),
          {
            status: 404,
          }
        );
      }

      const t = await Transaction.findOne({ tx_ref: trx.data.reference });

      if (!t) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          httpStatusResponse(404, "Could not find transaction"),
          {
            status: 404,
          }
        );
      }

      if (t.status === "success") {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          httpStatusResponse(409, "Transaction already processed"),
          {
            status: 409,
          }
        );
      }

      // Create the transaction for the user
      const trxPayload: transaction = {
        accountId: transferDetails.craccount,
        amount: Number(amount),
        note: `Your account has been creditted with ${formatCurrency(
          Number(amount),
          2
        )}`,
        meta: {
          ...transferDetails,
        },
        paymentMethod: "dedicatedAccount",
        status: "pending",
        tx_ref: trx.data.reference,
        type: "funding",
        user: user.id,
      };

      const transaction = new Transaction(trxPayload);

      // Credit the user account
      user.balance += Number(amount);

      await Promise.all([
        transaction.save(),
        user.save({ validateModifiedOnly: true }),
      ]);
    }

    const transaction = await Transaction.findOne({
      tx_ref: trx.data.reference,
    });

    if (!transaction) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(400, "Could not find transaction"),
        { status: 400 }
      );
    }

    if (transaction.status === "success") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(409, "Transaction already processed"),
        { status: 409 }
      );
    }

    const user = await User.findById(transaction.user);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(httpStatusResponse(400, "Could not find user"), {
        status: 400,
      });
    }

    // Credit the user account
    transaction.status = "success";
    transaction.amount = Number(amount);
    transaction.note = `Your account has been creditted with ${formatCurrency(
      Number(amount),
      2
    )}`;
    transaction.meta = {
      ...transaction.meta,
      ...transferDetails,
    };

    user.balance += Number(amount);

    await Promise.all([
      transaction.save({ validateModifiedOnly: true }),
      user.save({ validateModifiedOnly: true }),
    ]);

    return NextResponse.json(
      httpStatusResponse(200, "Transaction processed successfully"),
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
