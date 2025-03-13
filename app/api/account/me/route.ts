import { checkIfUserIsAuthenticated, httpStatusResponse } from "@/lib/utils";
import { Account } from "@/models/account";
import { findUserByEmail } from "@/models/users";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession();

    checkIfUserIsAuthenticated(session);

    const user = await findUserByEmail(session?.user.email!);

    const account = await Account.findOne({ user: user?.id });

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
