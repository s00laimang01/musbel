import { type NextRequest, NextResponse } from "next/server";
import { Transaction } from "@/models/transactions";
import { connectToDatabase } from "@/lib/connect-to-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;

    // Find bill by tx_ref with user lookup
    const bills = await Transaction.aggregate([
      { $match: { tx_ref: id, type: "bill" } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          tx_ref: 1,
          amount: 1,
          note: 1,
          status: 1,
          paymentMethod: 1,
          type: 1,
          accountId: 1,
          meta: 1,
          createdAt: 1,
          updatedAt: 1,
          customerName: "$userData.fullName",
          customerEmail: "$userData.auth.email",
        },
      },
    ]);

    if (!bills.length) {
      return NextResponse.json(
        { error: "Electricity bill not found" },
        { status: 404 }
      );
    }

    const bill = bills[0];

    // Format the bill data
    const formattedBill = {
      id: bill.tx_ref,
      customer: bill.customerName || "Unknown User",
      customerEmail: bill.customerEmail,
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
      meterNumber: bill.meta?.meterNumber,
      provider: bill.meta?.provider,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
      paymentMethod: bill.paymentMethod,
      note: bill.note,
    };

    return NextResponse.json(formattedBill);
  } catch (error) {
    console.error("Error fetching electricity bill:", error);
    return NextResponse.json(
      { error: "Failed to fetch electricity bill" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();

    // Find and update bill
    const updatedBill = await Transaction.findOneAndUpdate(
      { tx_ref: id, type: "bill" },
      {
        $set: {
          ...(body.amount && { amount: body.amount }),
          ...(body.status && { status: body.status }),
          ...(body.note && { note: body.note }),
          ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
          ...(body.meta && {
            meta: {
              ...(body.meta.usage && { usage: body.meta.usage }),
              ...(body.meta.dueDate && { dueDate: body.meta.dueDate }),
              ...(body.meta.meterNumber && {
                meterNumber: body.meta.meterNumber,
              }),
              ...(body.meta.provider && { provider: body.meta.provider }),
            },
          }),
        },
      },
      { new: true }
    );

    if (!updatedBill) {
      return NextResponse.json(
        { error: "Electricity bill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Electricity bill updated successfully",
      bill: updatedBill,
    });
  } catch (error) {
    console.error("Error updating electricity bill:", error);
    return NextResponse.json(
      { error: "Failed to update electricity bill" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;

    // Find and delete bill
    const deletedBill = await Transaction.findOneAndDelete({
      tx_ref: id,
      type: "bill",
    });

    if (!deletedBill) {
      return NextResponse.json(
        { error: "Electricity bill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Electricity bill deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting electricity bill:", error);
    return NextResponse.json(
      { error: "Failed to delete electricity bill" },
      { status: 500 }
    );
  }
}
