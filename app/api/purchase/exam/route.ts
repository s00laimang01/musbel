import { buyExam, httpStatusResponse } from "@/lib/utils";
import { Exam } from "@/models/exam";
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
    const { examId, quantity = 1, pin } = await request.json();

    const _session = await getServerSession();

    const user = await User.findOne({ "auth.email": _session?.user.email });

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(httpStatusResponse(404, "User not found"), {
        status: 404,
      });
    }

    await verifyUserTransactionPin(user.auth.email, pin);

    const exam = await Exam.findById(examId);
    session.startTransaction();

    if (!exam) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(httpStatusResponse(404, "Exam not found"), {
        status: 404,
      });
    }

    await verifyUserBalance(user.auth.email, exam.amount * Number(quantity));

    const tx_ref = new mongoose.Types.ObjectId().toString();

    const res = await buyExam(exam.examId, tx_ref, quantity);

    const trxPayload: transaction = {
      accountId: res["request-id"],
      amount: exam.amount * Number(quantity),
      meta: {
        ...res,
      },
      note: res.message,
      paymentMethod: "ownAccount",
      status: res.status === "success" ? "success" : "pending",
      tx_ref,
      type: "exam",
      user: user?._id!,
    };

    user.balance -= exam.amount * Number(quantity);
    const transaction = new Transaction(trxPayload);

    await Promise.all([
      transaction.save({ session }),
      user.save({ validateModifiedOnly: true }),
    ]);

    await session.commitTransaction();
    session.endSession();

    // If the purchase is successfully, send the examToken to the user via email -->RESEND

    return NextResponse.json(
      httpStatusResponse(200, "Exam purchased successfully"),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
