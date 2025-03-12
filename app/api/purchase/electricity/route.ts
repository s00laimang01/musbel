import { billPayment, httpStatusResponse } from "@/lib/utils";
import { addToRecentlyUsedContact } from "@/models/recently-used-contact";
import { Transaction } from "@/models/transactions";
import {
  User,
  verifyUserBalance,
  verifyUserTransactionPin,
} from "@/models/users";
import { transaction } from "@/types";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const {
      electricity,
      meterType,
      meterNumber,
      amount,
      pin,
      byPassValidator = false,
    } = await request.json();

    const _session = await getServerSession();

    const user = await User.findOne({ "auth.email": _session?.user.email });

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(httpStatusResponse(404, "User not found"));
    }

    await verifyUserTransactionPin(user.auth.email, pin);

    await verifyUserBalance(user.auth.email, amount);

    const tx_ref = new mongoose.Types.ObjectId().toString();

    const res = await billPayment({
      disco: electricity,
      meter_type: meterType,
      amount,
      bypass: byPassValidator,
      meter_number: meterNumber,
      "request-id": tx_ref,
    });

    user.balance -= Number(amount);

    const trxPayload: transaction = {
      accountId: res["request-id"],
      amount: Number(amount),
      meta: {
        ...res,
      },
      note: res.message,
      paymentMethod: "ownAccount",
      status: res.status === "success" ? "success" : "pending",
      tx_ref,
      type: "bill",
      user: user._id,
    };

    const transaction = new Transaction(trxPayload);

    await Promise.all([
      transaction.save({ session }),
      user.save({ session }),
      addToRecentlyUsedContact(
        meterNumber,
        "bill",
        { meterType, electricity },
        session
      ),
    ]);

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(httpStatusResponse(200, res.message), {
      status: 200,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
