import {
  checkIfUserIsAuthenticated,
  httpStatusResponse,
  restrictPropertyModification,
} from "@/lib/utils";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { findUserByEmail, User } from "@/models/users";
import { connectToDatabase } from "@/lib/connect-to-db";
import { Exam } from "@/models/exam";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    await connectToDatabase();

    await Exam.find({});

    const user = await findUserByEmail(session?.user?.email || "");

    return NextResponse.json(
      httpStatusResponse(
        200,
        "Account details fetched successfully",
        user?.toObject()
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

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();

    await checkIfUserIsAuthenticated(session);

    const updates = await request.json();

    await connectToDatabase();

    //   Prevent the user from modifying some certain properties
    restrictPropertyModification(updates, [
      "isEmailVerified",
      "isPhoneNumberVerified",
      "role",
      "balance",
      "createdAt",
      "auth",
      "auth.password",
    ]);

    //   Get the user and update the user information
    const user = await User.findOneAndUpdate(
      { "auth.email": session?.user?.email },
      {
        $set: updates,
      },
      {
        new: true,
      }
    );

    return NextResponse.json(
      httpStatusResponse(
        200,
        "User Information updated successfully",
        user?.toObject()
      ),
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
