import { connectToDatabase } from "@/lib/connect-to-db";
import { httpStatusResponse } from "@/lib/utils";
import { findUserByEmail, User } from "@/models/users";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { fullName, email, password, phoneNumber, country } =
      await request.json();

    // Validate input
    if (!(fullName && email && password && phoneNumber)) {
      return NextResponse.json(
        { message: "MISSING_REQUIRED_FIELDS: Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await findUserByEmail(email, {
      includePassword: true,
      throwOn404: false,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            "USER_ALREADY_EXISTED: Looks like you already have an account, Please signIn",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create([
      {
        phoneNumber,
        fullName,
        country,
        auth: {
          email,
          password: hashedPassword,
        },
        isEmailVerified: false,
        isPhoneVerified: false,
      },
    ]);

    // Return success without exposing password
    return NextResponse.json(
      httpStatusResponse(201, "User created successfully", {
        user: {
          id: user[0]._id.toString(),
          fullName: user[0].fullName,
          email: user[0].auth.email,
          phoneNumber: user[0].phoneNumber,
          country: user[0].country,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      httpStatusResponse(
        500,
        (error as Error).message || "An error occurred during registration"
      ),
      { status: 500 }
    );
  }
}
