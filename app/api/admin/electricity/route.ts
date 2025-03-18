import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/connect-to-db";
import { Transaction } from "@/models/transactions";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { type: "bill" };

    // Add search filter if provided
    if (search) {
      query.$or = [{ tx_ref: { $regex: search, $options: "i" } }];
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Execute query with user lookup
    const bills = await Transaction.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          tx_ref: 1,
          amount: 1,
          status: 1,
          type: 1,
          meta: 1,
          createdAt: 1,
          updatedAt: 1,
          customerName: "$userData.fullName",
          customerEmail: "$userData.auth.email",
        },
      },
    ]);

    // Get total count for pagination
    const total = await Transaction.countDocuments(query);

    // Transform data to match the frontend format
    const formattedBills = bills.map((bill) => ({
      id: bill.tx_ref,
      customer: bill.customerName || "Unknown User",
      amount: bill.amount,
      usage: bill.meta?.usage || 0,
      status:
        bill.status === "success"
          ? "Paid"
          : bill.status === "pending"
          ? "Pending"
          : "Overdue",
      dueDate:
        bill.meta?.dueDate ||
        new Date(bill.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    }));

    // Get statistics
    const totalBills = await Transaction.countDocuments({ type: "bill" });
    const pendingPayments = await Transaction.aggregate([
      { $match: { type: "bill", status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const averageBill = await Transaction.aggregate([
      { $match: { type: "bill" } },
      { $group: { _id: null, average: { $avg: "$amount" } } },
    ]);

    const stats = {
      totalBills,
      pendingPayments: pendingPayments[0]?.total || 0,
      averageBill: averageBill[0]?.average || 0,
    };

    return NextResponse.json({
      bills: formattedBills,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Error fetching electricity bills:", error);
    return NextResponse.json(
      { error: "Failed to fetch electricity bills" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();

    // Validate required fields
    if (!body.amount || !body.user || !body.accountId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a unique transaction reference
    const tx_ref = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create new transaction
    const newBill = new Transaction({
      amount: body.amount,
      note: body.note || "Electricity Bill Payment",
      status: body.status || "pending",
      paymentMethod: body.paymentMethod || "virtualAccount",
      tx_ref,
      type: "bill",
      user: body.user,
      accountId: body.accountId,
      meta: {
        usage: body.usage,
        dueDate: body.dueDate,
        meterNumber: body.meterNumber,
        provider: body.provider,
      },
    });

    await newBill.save();

    return NextResponse.json(
      {
        message: "Electricity bill created successfully",
        bill: newBill,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating electricity bill:", error);
    return NextResponse.json(
      { error: "Failed to create electricity bill" },
      { status: 500 }
    );
  }
}
