import { checkIfUserIsAuthenticated, httpStatusResponse } from "@/lib/utils";
import { Transaction } from "@/models/transactions";
import { User } from "@/models/users";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    const user = await User.findOne({ "auth.email": session?.user?.email });

    const transaction = await Transaction.findOne({ user: user?.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json(
      httpStatusResponse(
        200,
        "Last transaction fetched successfully",
        transaction
      ),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
