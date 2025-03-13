import { verifyTransactionWithBudPay } from "@/lib/server-utils";
import { formatCurrency, httpStatusResponse } from "@/lib/utils";
import { Account } from "@/models/account";
import { Transaction } from "@/models/transactions";
import { User } from "@/models/users";
import type { BudPayWebhookPayload, transaction } from "@/types";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

function logDebug(message: string, data?: any) {
  console.log(
    `[BudPay Webhook] ${message}`,
    data ? JSON.stringify(data, null, 2) : ""
  );
}

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

  logDebug(
    `Verifying webhook signature with publicKey: ${publicKey.substring(
      0,
      10
    )}...`
  );

  // Create merchant signature by hashing the public key with the secret key using HMAC-SHA512
  const merchantSignature = createHmac("sha512", secretKey)
    .update(publicKey)
    .digest("hex");

  logDebug(
    `Generated merchant signature (first 20 chars): ${merchantSignature.substring(
      0,
      20
    )}...`
  );
  logDebug(
    `Received webhook signature (first 20 chars): ${webhookSignature.substring(
      0,
      20
    )}...`
  );

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

  logDebug(`Webhook signature verification result: ${isValid}`);

  return isValid;
}

export async function POST(request: Request) {
  logDebug("Received BudPay webhook request");
  let session = null;

  try {
    const merchantsignature = request.headers.get("merchantsignature");

    logDebug(
      `Merchant signature from header: ${
        merchantsignature?.substring(0, 20) || "MISSING"
      }...`
    );

    // First verify that the trx is from budPay
    const isWebHookSignatureValid = verifyBudPayWebhook(
      process.env.BUDPAY_SECRET_KEY!,
      process.env.BUDPAY_PUBLIC_KEY!,
      merchantsignature!
    );

    logDebug(`Webhook signature validation result: ${isWebHookSignatureValid}`);

    if (!isWebHookSignatureValid) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "INVALID_WEBHOOK_SIGNATURE: we could not identify this webhook request, this may be a fraudlet attempt. Please contact admin."
        ),
        {
          status: 400,
        }
      );
    }

    const payload = (await request.json()) as BudPayWebhookPayload;

    if (!payload) {
      return NextResponse.json(httpStatusResponse(400, "Invalid payload"), {
        status: 400,
      });
    }

    logDebug("Webhook payload received:", {
      payload,
    });

    // Validate webhook data before starting transaction
    if (payload.notify !== "transaction") {
      return NextResponse.json(httpStatusResponse(400, "Invalid notify type"), {
        status: 400,
      });
    }

    if (payload.notifyType !== "successful") {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "Aborting process, transaction is not yet marked as successful."
        )
      );
    }

    const { type, id, amount, customer, reference } = payload.data;

    logDebug(`Transaction data:`, { type, id, amount, customer });

    if (isNaN(Number(amount))) {
      return NextResponse.json(httpStatusResponse(400, "Invalid amount"), {
        status: 400,
      });
    }

    // Create session and start transaction AFTER initial validation
    session = await mongoose.startSession();
    session.startTransaction();

    const trx = await verifyTransactionWithBudPay(reference);

    if (!trx.status) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(
          400,
          "UNABLE_TO_VERIFY_TRANSACTION: something went wrong while trying to get this transaction."
        ),
        {
          status: 400,
        }
      );
    }

    logDebug("BudPay transaction verification result:", trx);

    if (type === "dedicated_account") {
      // We know this is a user trying to fund their account using their dedicated account number
      logDebug(
        `Looking for account with accountRef: ${customer.customer_code}, accountNumber: ${payload.transferDetails.craccount}`
      );
      const account = await Account.findOne({
        "accountDetails.accountRef": customer.customer_code,
      }).session(session);

      logDebug(`Account found:`, account ? { id: account._id } : "NOT FOUND");

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
      const user = await User.findById(account.user).session(session);

      logDebug(
        `User found:`,
        user ? { id: user._id, balance: user.balance } : "NOT FOUND"
      );

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

      const t = await Transaction.findOne({
        tx_ref: trx.data.reference,
      }).session(session);

      logDebug(
        `Transaction found:`,
        t ? { id: t._id, status: t.status, amount: t.amount } : "NOT FOUND"
      );

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
        accountId: payload.transferDetails.craccount,
        amount: Number(amount),
        note: `Your account has been creditted with ${formatCurrency(
          Number(amount),
          2
        )}`,
        meta: {
          ...payload.transferDetails,
        },
        paymentMethod: "dedicatedAccount",
        status: "pending",
        tx_ref: trx.data.reference,
        type: "funding",
        user: user.id,
      };

      logDebug(`Creating transaction with payload:`, trxPayload);

      const transaction = new Transaction(trxPayload);

      // Credit the user account
      user.balance += Number(amount);

      await transaction.save({ session });
      await user.save({ validateModifiedOnly: true, session });

      logDebug(`Updated user balance: ${user.balance}`);
      return NextResponse.json(
        httpStatusResponse(
          200,
          "TRANSACTION_PROCESSED: your transaction has been successfully processed and the associated account has been creditted."
        )
      );
    }

    logDebug(`Looking for transaction with tx_ref: ${trx.data.reference}`);

    const transaction = await Transaction.findOne({
      tx_ref: trx.data.reference,
    }).session(session);

    logDebug(
      `Transaction found:`,
      transaction
        ? { id: transaction._id, status: transaction.status }
        : "NOT FOUND"
    );

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

    const user = await User.findById(transaction.user).session(session);

    logDebug(
      `User found:`,
      user ? { id: user._id, balance: user.balance } : "NOT FOUND"
    );

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(httpStatusResponse(400, "Could not find user"), {
        status: 400,
      });
    }

    // Credit the user account
    logDebug(
      `Updating transaction to success and crediting user account with ${amount}`
    );
    logDebug(
      `Previous user balance: ${user.balance}, New balance will be: ${
        user.balance + Number(amount)
      }`
    );

    transaction.status = "success";
    transaction.amount = Number(amount);
    transaction.note = `Your account has been creditted with ${formatCurrency(
      Number(amount),
      2
    )}`;
    transaction.meta = {
      ...transaction.meta,
      ...payload.transferDetails,
    };

    user.balance += Number(amount);

    await transaction.save({ validateModifiedOnly: true, session });
    await user.save({ validateModifiedOnly: true, session });

    // Commit the transaction only after all operations succeed
    await session.commitTransaction();
    session.endSession();

    logDebug("Transaction processed successfully");

    return NextResponse.json(
      httpStatusResponse(200, "Transaction processed successfully"),
      { status: 200 }
    );
  } catch (error) {
    logDebug(`Error processing webhook:`, error);

    // Only abort if session exists and has an active transaction
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch (sessionError) {
        logDebug(`Error aborting transaction:`, sessionError);
      }
    }

    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
