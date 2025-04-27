import { NextResponse } from "next/server";
import PasswordResetToken from "@/models/password-reset-token";
import { connectToDatabase } from "@/lib/connect-to-db";
import { User } from "@/models/users";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Find the reset token
    const resetToken = await PasswordResetToken.findOne({ email });

    if (!resetToken) {
      return NextResponse.json(
        { message: "Invalid reset code" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (resetToken.expires < new Date()) {
      // Delete the expired token
      await PasswordResetToken.deleteOne({ email });

      return NextResponse.json(
        { message: "Reset code has expired" },
        { status: 400 }
      );
    }

    // Verify OTP
    if (resetToken.otp !== otp) {
      return NextResponse.json(
        { message: "Invalid reset code" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findOne({ "auth.email": email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update the user's password
    user.auth.password = newPassword;
    await user.save();

    // Delete the used token
    await PasswordResetToken.deleteOne({ email });

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
