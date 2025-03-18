import { connectToDatabase } from "@/lib/connect-to-db";
import { formatCurrency, httpStatusResponse } from "@/lib/utils";
import { Account } from "@/models/account";
import { Transaction } from "@/models/transactions";
import { User } from "@/models/users";
import { transaction } from "@/types";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectToDatabase();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(httpStatusResponse(404, "User not found"), {
        status: 404,
      });
    }

    const transactions = await Transaction.find({ user: user.id }).sort({
      createdAt: -1,
    });

    const dedicatedAccount = await Account.findOne({
      user: user.id,
      hasDedicatedAccountNumber: true,
    });

    return NextResponse.json(
      httpStatusResponse(200, "Success", {
        transactions,
        user,
        dedicatedAccount,
      })
    );
  } catch (error) {
    return NextResponse.json(httpStatusResponse(500, (error as Error).message));
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const updates = await request.json();

    if (updates.balance) {
      const user = await User.findById(id);

      if (!user) {
        return NextResponse.json(httpStatusResponse(404, "User not found"), {
          status: 404,
        });
      }

      if (updates.balance < user.balance) {
        return NextResponse.json(
          httpStatusResponse(400, "BALANCE_IS_LESS_THAN_CURRENT_BALANCE"),
          {
            status: 400,
          }
        );
      }

      if (user.balance !== updates.balance) {
        const amountToCredit = updates.balance - user.balance;

        const tx_ref = new mongoose.Types.ObjectId().toString();

        // Create a transaction for this
        const trxPayload: transaction = {
          accountId: tx_ref,
          amount: amountToCredit,
          meta: {
            manualFunding: "true",
          },
          note: `Your account has been credited with ${formatCurrency(
            amountToCredit
          )}`,
          paymentMethod: "dedicatedAccount",
          status: "success",
          tx_ref,
          type: "funding",
          user: user.id,
        };

        const transaction = new Transaction(trxPayload);
        await transaction.save({});
      }
    }

    const user = await User.findByIdAndUpdate(id, { $set: updates });

    return NextResponse.json(httpStatusResponse(200, undefined, user), {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
