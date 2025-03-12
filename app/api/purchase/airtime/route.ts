import { buyAirtime, httpStatusResponse } from "@/lib/utils";
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
      pin,
      amount,
      network,
      phoneNumber,
      byPassValidator = false,
    } = await request.json();

    const _session = await getServerSession();

    const user = await User.findOne({
      "auth.email": _session?.user.email,
    }).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(httpStatusResponse(400, "User not found"), {
        status: 400,
      });
    }

    await verifyUserTransactionPin(user?.auth.email!, pin);

    console.log({ amount });
    await verifyUserBalance(user?.auth.email!, amount);

    const tx_ref = new mongoose.Types.ObjectId().toString();

    const res = await buyAirtime(
      network,
      phoneNumber,
      amount,
      tx_ref,
      byPassValidator,
      "VTU"
    );

    const trxPayload: transaction = {
      accountId: res["request-id"],
      amount,
      note: res.message,
      paymentMethod: "ownAccount",
      status: "pending",
      tx_ref,
      type: "airtime",
      user: user?.id,
    };

    // Update user balance
    user.balance -= amount;

    const transaction = new Transaction(trxPayload);

    await Promise.all([
      transaction.save({ session }),
      addToRecentlyUsedContact(
        phoneNumber,
        "airtime",
        { amount, network },
        session
      ),
      await user.save({ session }),
    ]);

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(httpStatusResponse(200, res.message, res), {
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
