import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { httpStatusResponse } from "@/lib/utils";
import { connectToDatabase } from "@/lib/connect-to-db";
import { refundUser } from "@/lib/server-utils";
import { findUserByEmail } from "@/models/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.tx_ref && !body?.transactionId) {
      throw new Error("tx_ref or transactionId are required");
    }

    // Get the email of the current authenticated user
    const serverSession = await getServerSession();

    if (!serverSession?.user?.email) {
      throw new Error(
        "UNAUTHORIZED_REQUEST: Please login before you continue."
      );
    }

    const user = await findUserByEmail(serverSession?.user?.email);

    if (!user) {
      throw new Error("USER_NOT_FOUND: User not found");
    }

    if (user.role !== "admin") {
      throw new Error(
        "UNAUTHORIZED_REQUEST: You are not authorized to perform this action."
      );
    }

    await connectToDatabase();

    const res = await refundUser(body.tx_ref || body?.transactionId);

    return NextResponse.json(httpStatusResponse(200, res.message), {
      status: 200,
    });
  } catch (error) {
    console.error("Data purchase error:", error);

    // Determine appropriate status code
    const statusCode = error instanceof z.ZodError ? 400 : 500;
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(httpStatusResponse(statusCode, errorMessage), {
      status: statusCode,
    });
  }
}
