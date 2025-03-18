import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/connect-to-db";
import { Transaction } from "@/models/transactions";
import { formatCurrency, httpStatusResponse } from "@/lib/utils";
import { User } from "@/models/users";

export async function GET() {
  try {
    await connectToDatabase();

    const totalTransactions = await Transaction.aggregate([
      {
        $match: {
          status: "success",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const users = await User.countDocuments({});

    const pendingPayments = await Transaction.countDocuments({
      status: "pending",
    });

    const totalDataPurchase = await Transaction.countDocuments({
      type: "data",
      status: "success",
    });

    const _totalTransactions =
      totalTransactions.length > 0 ? totalTransactions[0].total : 0;

    // Return combined data
    return NextResponse.json(
      httpStatusResponse(200, undefined, {
        totalTransactions: formatCurrency(_totalTransactions),
        users,
        pendingPayments,
        totalDataPurchase,
      })
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
