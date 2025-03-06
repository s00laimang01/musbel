import { checkIfUserIsAuthenticated, httpStatusResponse } from "@/lib/utils";
import { User } from "@/models/users";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();

    // Check if user is authenticated
    checkIfUserIsAuthenticated(session);

    await User.findOneAndDelete({ "auth.email": session?.user.email });

    return NextResponse.json(
      httpStatusResponse(200, "Account deleted successfully"),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
