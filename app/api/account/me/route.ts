import { checkIfUserIsAuthenticated, httpStatusResponse } from "@/lib/utils";
import { Account } from "@/models/account";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession();

    checkIfUserIsAuthenticated(session);

    const account = await Account.findOne({ user: session?.user.email });

    console.log({ account });

    return NextResponse.json(
      httpStatusResponse(
        200,
        "User account fetched successfully",
        account?.toObject()
      )
    );
  } catch (error) {
    return NextResponse.json(httpStatusResponse(500, (error as Error).message));
  }
}
