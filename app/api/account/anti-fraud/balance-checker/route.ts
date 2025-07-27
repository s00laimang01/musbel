import { connectToDatabase } from "@/lib/connect-to-db";
import { configs } from "@/lib/constants";
import { sendEmail } from "@/lib/server-utils";
import { httpStatusResponse } from "@/lib/utils";
import { Transaction } from "@/models/transactions";
import { User } from "@/models/users";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { userId, tx_ref, oldBalance, expectedNewBalance, signature } =
    await request.json();
  try {
    if (signature !== configs["X-RAPIDAPI-KEY"]) {
      return NextResponse.json(httpStatusResponse(401, "Unauthorized"));
    }

    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(httpStatusResponse(404, "User not found"));
    }

    if (user.balance === expectedNewBalance) {
      return NextResponse.json(
        httpStatusResponse(200, "Balance already updated"),
        { status: 200 }
      );
    }

    const transaction = await Transaction.findOne({ tx_ref, user: user._id });

    if (!transaction) {
      return NextResponse.json(
        httpStatusResponse(404, "Transaction not found"),
        { status: 404 }
      );
    }

    //After the transaction is being made if the user is not debitted, debit the user now
    if (user.balance === oldBalance) {
      const newBalance = user.balance - transaction.amount;

      if (newBalance > expectedNewBalance) {
        user.balance = expectedNewBalance;
      } else {
        user.balance = newBalance;
      }
    }

    await user.save({ validateModifiedOnly: true });

    return NextResponse.json(
      httpStatusResponse(200, "User balance updated successfuly")
    );
  } catch (error) {
    await sendEmail(
      ["suleimaangee@gmail.com"],
      `Unable to verify user ${userId} balance`,
      "Unable to verify balance"
    );
  }
}
