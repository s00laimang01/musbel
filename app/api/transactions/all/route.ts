import { type NextRequest, NextResponse } from "next/server";
import { Transaction } from "@/models/transactions";
import { User } from "@/models/users";
import { connectToDatabase } from "@/lib/connect-to-db";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");

    const session = await getServerSession();

    // Connect to the database
    await connectToDatabase();

    // Build query filters
    const query: any = {};

    const user = await User.findOne({ "auth.email": session?.user.email });

    const userId = user?.id;

    // User is required
    if (!user) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    query.user = userId;

    // Add optional filters
    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalCount = await Transaction.countDocuments(query);

    return NextResponse.json({
      transactions,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
