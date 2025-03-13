import { checkIfUserIsAuthenticated, httpStatusResponse } from "@/lib/utils";
import { Account } from "@/models/account";
import { findUserByEmail } from "@/models/users";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { bvn } = await request.json();

    const session = await getServerSession();

    checkIfUserIsAuthenticated(session);

    const user = await findUserByEmail(session?.user?.email as string, {
      includePassword: false,
      throwOn404: true,
    });

    if (!user?.isEmailVerified) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "EMAIL_NOT_VERIFIED: It looks like you haven't verified your email, Please verify your email and continue."
        ),
        { status: 400 }
      );
    }

    const account = await Account.findOne({ user: user.auth.email });

    if (account?.hasDedicatedAccountNumber) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "ACCOUNT_ALREADY_VERIFIED: It looks like you have already verified your account."
        ),
        { status: 400 }
      );
    }

    return NextResponse.json(
      httpStatusResponse(
        200,
        "ACCOUNT_VERIFIED: A dedicated virtual account will be assign to you shortly"
      )
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
