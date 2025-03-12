import { httpStatusResponse } from "@/lib/utils";
import { User, verifyUserTransactionPin } from "@/models/users";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const { oldPin, newPin, confirmPin } = await request.json();

    if (oldPin === newPin) {
      return NextResponse.json(
        httpStatusResponse(400, "New pin cannot be the same as the old pin"),
        { status: 400 }
      );
    }

    if (newPin !== confirmPin) {
      return NextResponse.json(
        httpStatusResponse(400, "New pin and confirm pin do not match"),
        { status: 400 }
      );
    }

    const session = await getServerSession();

    await verifyUserTransactionPin(session?.user?.email as string, oldPin);

    await User.findOneAndUpdate(
      { "auth.email": session?.user?.email },
      {
        $set: {
          "auth.transactionPin": newPin,
        },
      }
    );

    return NextResponse.json(
      httpStatusResponse(200, "Transaction pin updated successfully"),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
