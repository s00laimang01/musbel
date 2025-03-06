import { checkIfUserIsAuthenticated, httpStatusResponse } from "@/lib/utils";
import { findUserByEmail } from "@/models/users";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();

    // Check if user is authenticated
    checkIfUserIsAuthenticated(session);

    const { currentPassword, newPassword, verifyNewPassword } =
      await request.json();

    // Validate required fields
    if (!(currentPassword && newPassword && verifyNewPassword)) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "MISSING_REQUIRED_FIELDS: Missing required fields"
        ),
        {
          status: 400,
        }
      );
    }

    // Validate password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "PASSWORD_TOO_SHORT: Password must be at least 6 characters"
        ),
        {
          status: 400,
        }
      );
    }

    // Validate password match
    if (newPassword !== verifyNewPassword) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "PASSWORD_MISMATCH: Your password and verify password do not match"
        ),
        { status: 400 }
      );
    }

    // Get user with password
    const user = await findUserByEmail(session?.user.email!, {
      includePassword: true,
      throwOn404: true,
    });

    if (!user?.auth?.password) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "ACCOUNT_ERROR: Unable to update password for this account type"
        ),
        { status: 400 }
      );
    }

    // Verify current password is correct
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.auth.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "INVALID_PASSWORD: Current password is incorrect"
        ),
        {
          status: 400,
        }
      );
    }

    // Check if new password is the same as current
    const isSamePassword = newPassword === currentPassword;

    if (isSamePassword) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "PASSWORD_UNCHANGED: New password must be different from current password"
        ),
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.auth.password = hashedPassword;
    await user.save({ validateBeforeSave: true });

    return NextResponse.json(
      httpStatusResponse(200, "Password updated successfully"),
      { status: 200 }
    );
  } catch (error) {
    console.error("Password update error:", error);

    return NextResponse.json(
      httpStatusResponse(500, "An error occurred while updating your password"),
      { status: 500 }
    );
  }
}
