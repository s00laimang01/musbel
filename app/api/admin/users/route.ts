import { connectToDatabase } from "@/lib/connect-to-db";
import { httpStatusResponse } from "@/lib/utils";
import { User } from "@/models/users";
import { transactionStatus } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const req = request.nextUrl.searchParams;

    const page = Number(req.get("page") || 1);
    const limit = Number(req.get("limit") || 10);
    const skip = (page - 1) * limit;
    const search = req.get("search") as string;
    const status = req.get("status") as transactionStatus;
    const role = req.get("role") as string;

    // Build query based on filters
    const query: any = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { "auth.email": { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status.toLowerCase();
    }

    if (role) {
      query.role = role.toLowerCase();
    }

    await connectToDatabase();

    // Execute query with pagination
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return NextResponse.json(
      httpStatusResponse(200, "Users fetched successfully", {
        users,
        total,
      })
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      httpStatusResponse(httpStatusResponse(500, (error as Error).message))
    );
  }
}
