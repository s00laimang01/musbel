import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import PasswordResetToken from "@/models/password-reset-token";
import { connectToDatabase } from "@/lib/connect-to-db";
import { User } from "@/models/users";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ "auth.email": email });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "If your email exists in our system, you will receive a reset code shortly",
        },
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

    // Initialize Resend with your API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    async function sendPasswordResetEmail(
      email: string,
      otp: string,
      userName?: string
    ) {
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
            .otp-container {
              margin: 30px 0;
              text-align: center;
            }
            .otp {
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 5px;
              color: #0066cc;
              padding: 10px 20px;
              background-color: #f5f5f5;
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
              
              <p>We received a request to reset your password. To complete the process, please use the following verification code:</p>
              
              <div class="otp-container">
                <div class="otp">${otp}</div>
              </div>
              
              <div class="note">
                <strong>Important:</strong> This code will expire in 10 minutes for security reasons.
              </div>
              
              <p>If you didn't request a password reset, please ignore this email or contact our support team if you believe this is an error.</p>
              
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

        // Text version as fallback
        const emailText = `
          Reset Your Password
          
          Hello ${userName || "there"},
          
          We received a request to reset your password. To complete the process, please use the following verification code:
          
          ${otp}
          
          Important: This code will expire in 10 minutes for security reasons.
          
          If you didn't request a password reset, please ignore this email or contact our support team if you believe this is an error.
          
          Thank you,
          The Team
        `;

        // Send the email
        const { data, error } = await resend.emails.send({
          from: "noreply@yourdomain.com",
          to: email,
          subject: "Reset Your Password",
          html: emailHtml,
          text: emailText,
        });

        if (error) {
          console.error("Failed to send password reset email:", error);
          throw new Error(`Failed to send email: ${error.message}`);
        }

        console.log("Password reset email sent successfully:", data);
        return { success: true, data };
      } catch (error) {
        console.error("Error sending password reset email:", error);
        return { success: false, error };
      }
    }

    await sendPasswordResetEmail(
      user.auth.email,
      otp,
      user.fullName.split(" ")[0]
    );

    return NextResponse.json(
      {
        message:
          "If your email exists in our system, you will receive a reset code shortly",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
