import { NextResponse } from "next/server";
import { Transaction } from "@/models/transactions";
import { connectToDatabase } from "@/lib/connect-to-db";

export async function GET() {
  try {
    await connectToDatabase();

    // Get current date and last month date
    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Get total bills count
    const totalBills = await Transaction.countDocuments({ type: "bill" });

    // Get last month's total bills count
    const lastMonthBills = await Transaction.countDocuments({
      type: "bill",
      createdAt: { $gte: lastMonth, $lt: now },
    });

    // Get previous month's total bills count
    const twoMonthsAgo = new Date(lastMonth);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1);
    const previousMonthBills = await Transaction.countDocuments({
      type: "bill",
      createdAt: { $gte: twoMonthsAgo, $lt: lastMonth },
    });

    // Calculate percentage change
    const billsPercentChange =
      previousMonthBills > 0
        ? ((lastMonthBills - previousMonthBills) / previousMonthBills) * 100
        : 0;

    // Get pending payments amount
    const pendingPayments = await Transaction.aggregate([
      { $match: { type: "bill", status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Get last month's pending payments
    const lastMonthPending = await Transaction.aggregate([
      {
        $match: {
          type: "bill",
          status: "pending",
          createdAt: { $gte: lastMonth, $lt: now },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Get previous month's pending payments
    const previousMonthPending = await Transaction.aggregate([
      {
        $match: {
          type: "bill",
          status: "pending",
          createdAt: { $gte: twoMonthsAgo, $lt: lastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Calculate percentage change for pending payments
    const pendingPercentChange =
      previousMonthPending[0]?.total > 0
        ? ((lastMonthPending[0]?.total - previousMonthPending[0]?.total) /
            previousMonthPending[0]?.total) *
          100
        : 0;

    // Get average bill amount
    const averageBill = await Transaction.aggregate([
      { $match: { type: "bill" } },
      { $group: { _id: null, average: { $avg: "$amount" } } },
    ]);

    // Get last month's average bill amount
    const lastMonthAverage = await Transaction.aggregate([
      {
        $match: {
          type: "bill",
          createdAt: { $gte: lastMonth, $lt: now },
        },
      },
      { $group: { _id: null, average: { $avg: "$amount" } } },
    ]);

    // Get previous month's average bill amount
    const previousMonthAverage = await Transaction.aggregate([
      {
        $match: {
          type: "bill",
          createdAt: { $gte: twoMonthsAgo, $lt: lastMonth },
        },
      },
      { $group: { _id: null, average: { $avg: "$amount" } } },
    ]);

    // Calculate percentage change for average bill
    const averagePercentChange =
      previousMonthAverage[0]?.average > 0
        ? ((lastMonthAverage[0]?.average - previousMonthAverage[0]?.average) /
            previousMonthAverage[0]?.average) *
          100
        : 0;

    return NextResponse.json({
      totalBills: {
        count: totalBills,
        percentChange: billsPercentChange,
      },
      pendingPayments: {
        amount: pendingPayments[0]?.total || 0,
        percentChange: pendingPercentChange,
      },
      averageBill: {
        amount: averageBill[0]?.average || 0,
        percentChange: averagePercentChange,
      },
    });
  } catch (error) {
    console.error("Error fetching electricity bill stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch electricity bill statistics" },
      { status: 500 }
    );
  }
}
