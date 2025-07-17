import { connectToDatabase } from "@/lib/connect-to-db";
import { httpStatusResponse } from "@/lib/utils";
import { User } from "@/models/users";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const type =
      searchParams.get("type") || ("email" as "email" | "phoneNumber");
    const identifier = searchParams.get("identifier") as string;

    let user;

    await connectToDatabase();

    if (type === "email") {
      user = await User.exists({ "auth.email": identifier });
    } else if (type === "phoneNumber") {
      user = await User.exists({ phoneNumber: identifier });
    }

    return NextResponse.json(
      httpStatusResponse(
        200,
        !!user
          ? `${
              type === "email"
                ? "User with this email already exist"
                : "User with this phone number already exist"
            }`
          : "User is clear to create an account",
        { userExist: !!user }
      ),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      {
        status: 500,
      }
    );
  }
}
