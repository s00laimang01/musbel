import { connectToDatabase } from "@/lib/connect-to-db";
import { configs } from "@/lib/constants";
import { sendEmail } from "@/lib/server-utils";
import { checkIfUserIsAuthenticated, httpStatusResponse } from "@/lib/utils";
import { OTP } from "@/models/otp";
import { User } from "@/models/users";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { type = "email" } = await request.json();

    const session = await getServerSession();

    checkIfUserIsAuthenticated(session);

    if (type === "phoneNumber") {
      return NextResponse.json(
        httpStatusResponse(
          409,
          "VERIFICATION_NOT_SUPPORTED: Phone number verification is not supported yet"
        ),
        { status: 409 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ "auth.email": session?.user.email });

    if (!user) {
      return NextResponse.json(httpStatusResponse(404, "User not found"), {
        status: 404,
      });
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "EMAIL_ALREADY_VERIFIED: Your email address has already been verified, Thank you!"
        ),
        {
          status: 400,
        }
      );
    }

    // Check existing OTP attempts
    const existingOtpAttempts = await OTP.countDocuments({
      user: user._id,
      createdAt: { $gte: new Date(Date.now() - 1 * 60 * 60 * 1000) }, // Last 1 hour
    });

    if (existingOtpAttempts >= 3) {
      return NextResponse.json(
        httpStatusResponse(
          429,
          "TOO_MANY_REQUEST: Too many verification attempts. Please try again later."
        ),
        {
          status: 429,
        }
      );
    }

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create OTP record
    const newOtp = new OTP({
      otp: otpCode,
      user: user._id,
      expirationTime: new Date(Date.now() + 15 * 60000),
    });
    await newOtp.save();

    const emailTemplate = `<div style="font-family: Arial, sans-serif max-width: 600px; margin: 0 auto;">
    <h2>Email Verification</h2>
    <p>Your verification code is:</p>
    <h1 style="background-color: #f0f0f0; paddingtext-align: center; letter-spacing: 5px;">${otpCode}</h1>
    <p>This code will expire in 15 minutes.</p>
    <small>If you did not request this verification,ignore this email.</small>
    </div>`;

    await sendEmail(
      [user.auth.email],
      emailTemplate,
      `Email Verification OTP - ${configs.appName}`
    );

    return NextResponse.json(
      httpStatusResponse(200, "OTP sent successfully to your email"),
      { status: 200 }
    );
  } catch (error) {
    console.error("OTP Generation Error:", error);
    return NextResponse.json(
      httpStatusResponse(
        500,
        "Error generating OTP: " + (error as Error).message
      ),
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams;

    const otp = await OTP.findOne({ otp: q.get("otp") });

    if (!otp) {
      return NextResponse.json(
        httpStatusResponse(404, "INVALID_OTP: OTP not found"),
        { status: 404 }
      );
    }

    if (otp.expirationTime < new Date()) {
      return NextResponse.json(
        httpStatusResponse(400, "OTP_EXPIRED: OTP has expired"),
        { status: 400 }
      );
    }

    const user = await User.findById(otp.user);

    if (!user) {
      return NextResponse.json(
        httpStatusResponse(404, "USER_NOT_FOUND: User not found"),
        { status: 404 }
      );
    }

    user.isEmailVerified = true;

    await Promise.all([
      user.save({ validateModifiedOnly: true }),
      otp.deleteOne(),
    ]);

    return NextResponse.json(
      httpStatusResponse(200, "Email verified successfully"),
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
