import { connectToDatabase } from "@/lib/connect-to-db";
import { createDedicatedVirtualAccount } from "@/lib/server-utils";
import { httpStatusResponse } from "@/lib/utils";
import { Account } from "@/models/account";
import { App } from "@/models/app";
import { findUserByEmail, User } from "@/models/users";
import { availableBanks, dedicatedAccountNumber } from "@/types";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { fullName, email, password, phoneNumber, country } =
      await request.json();

    // Validate input
    if (!(fullName && email && password && phoneNumber)) {
      await session.commitTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "MISSING_REQUIRED_FIELDS: Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const appConfigs = await App.findOne({});

    if (appConfigs?.stopAccountCreation) {
      await session.commitTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(
          400,
          "ACCOUNT_CREATION_STOPPED: Account creation has been stopped"
        ),
        { status: 400 }
      );
    }

    let dedicatedAccountToOpenForUsers: availableBanks;

    if (
      appConfigs?.bankAccountToCreateForUsers &&
      appConfigs?.bankAccountToCreateForUsers !== "random"
    ) {
      dedicatedAccountToOpenForUsers = appConfigs?.bankAccountToCreateForUsers;
    } else {
      const banks: availableBanks[] = [
        "9PSB",
        "BANKLY",
        "PALMPAY",
        "PROVIDUS",
        "SAFEHAVEN",
      ];

      dedicatedAccountToOpenForUsers = banks[2];
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email, {
      includePassword: true,
      throwOn404: false,
    });

    if (existingUser) {
      await session.commitTransaction();
      session.endSession();
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
    const user = await User.create(
      [
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
      ],
      { session }
    );

    const newUser = user[0];

    const [firstName, lastName] = newUser?.fullName?.split(" ");

    const account = await createDedicatedVirtualAccount({
      bank: dedicatedAccountToOpenForUsers,
      email: newUser?.auth?.email,
      firstName,
      lastName,
      phone: newUser.phoneNumber,
      reference: user[0]?.id,
    });

    if (!account.status) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(
          400,
          "Unable to create a dedicated account for you, please try again later"
        ),
        { status: 400 }
      );
    }

    const { account: newVirtualAccount, ...rest } = account.data;

    // Save dedicated account
    const virtualAccount = newVirtualAccount[0];

    const virtualAccountPayload: dedicatedAccountNumber = {
      accountDetails: {
        accountName: virtualAccount.account_name,
        accountNumber: virtualAccount.account_number,
        accountRef: rest.reference,
        bankCode: virtualAccount.bank_id,
        bankName: virtualAccount.bank_name,
        expirationDate: account.message,
      },
      hasDedicatedAccountNumber: true,
      order_ref: newUser.id,
      user: newUser.id,
    };

    const _account = new Account(virtualAccountPayload);

    await _account.save({ session });

    await session.commitTransaction();
    session.endSession();

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
    if (session) {
      await session.commitTransaction();
      session.endSession();
    }
    return NextResponse.json(
      httpStatusResponse(
        500,
        (error as Error).message || "An error occurred during registration"
      ),
      { status: 500 }
    );
  }
}
