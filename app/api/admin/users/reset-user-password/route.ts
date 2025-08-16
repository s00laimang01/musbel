import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import PasswordResetToken from "@/models/password-reset-token";
import { connectToDatabase } from "@/lib/connect-to-db";
import { User } from "@/models/users";
import { sendEmail } from "@/lib/server-utils";
import { httpStatusResponse } from "@/lib/utils";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        httpStatusResponse(
          401,
          "UNAUTHORIZED_REQUEST: you are not allow to make this request."
        )
      );
    }

    const isAdmin = await User.exists({
      "auth.email": session?.user.email,
      role: "admin",
    });

    if (!isAdmin) {
      return NextResponse.json(
        httpStatusResponse(
          401,
          "UNAUTHORIZED_REQUEST: you are not allow to make this request."
        )
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ "auth.email": email });

    if (!user) {
      return NextResponse.json(
        httpStatusResponse(
          404,
          "If your email exists in our system, you will receive a reset code shortly"
        ),
        { status: 200 }
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Generate a token for additional security
    const token = randomBytes(32).toString("hex");

    // Set expiry time (15 minutes from now)
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    // Check if a reset token already exists for this email
    const existingToken = await PasswordResetToken.findOne({ email });

    if (existingToken) {
      // Update the existing token
      existingToken.otp = otp;
      existingToken.token = token;
      existingToken.expires = expires;
      await existingToken.save();
    } else {
      // Create a new token
      await PasswordResetToken.create({
        email,
        otp,
        token,
        expires,
      });
    }

    const resetLink = `https://www.kinta-sme.com/auth/reset-password?email=${email}&otp=${otp}`;

    async function sendPasswordResetEmail(email: string, userName?: string) {
      try {
        // Generate the email HTML with the OTP
        const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #0066cc;
              padding: 20px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 20px;
              background-color: #ffffff;
            }
            .button-container {
              margin: 30px 0;
              text-align: center;
            }
            .button {
              background-color: #0066cc;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              font-size: 16px;
              border-radius: 5px;
              display: inline-block;
            }
            .footer {
              font-size: 12px;
              color: #999;
              text-align: center;
              margin-top: 30px;
            }
            .note {
              background-color: #fffde7;
              padding: 10px;
              border-left: 4px solid #ffd600;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${userName || "there"},</p>
              
              <p>We received a request to reset your password. To complete the process, please click the button below:</p>
              
              <div class="button-container">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              
              <div class="note">
                <strong>Important:</strong> This link will expire in 10 minutes for security reasons.
              </div>
              
              <p>If you didn't request a password reset, you can safely ignore this email or contact our support team if you believe this is an error.</p>
              
              <p>Thank you,<br>The Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
        `;

        // Send the email
        sendEmail([email], emailHtml, "Reset your Kinta SME password");

        return { success: true };
      } catch (error) {
        console.error("Error sending password reset email:", error);
        return { success: false, error };
      }
    }

    await sendPasswordResetEmail(user.auth.email, user.fullName.split(" ")[0]);

    return NextResponse.json(
      httpStatusResponse(
        200,
        "Email will be sent to user if the user exist in our database."
      ),
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(httpStatusResponse(500, (err as Error).message), {
      status: 500,
    });
  }
}
