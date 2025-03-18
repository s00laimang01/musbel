import { connectToDatabase } from "@/lib/connect-to-db";
import { processVirtualAccountForUser } from "@/lib/server-utils";
import { httpStatusResponse } from "@/lib/utils";
import { Account } from "@/models/account";
import { User } from "@/models/users";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(httpStatusResponse(404, "User not found"), {
        status: 404,
      });
    }

    const account = await Account.findOne({
      hasDedicatedAccountNumber: true,
      user: user.id,
    });

    if (account) {
      return NextResponse.json(
        httpStatusResponse(400, "Account already exists"),
        { status: 400 }
      );
    }

    await processVirtualAccountForUser(user);

    return NextResponse.json(
      httpStatusResponse(200, "Account created successfully"),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
