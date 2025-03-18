import { connectToDatabase } from "@/lib/connect-to-db";
import { configs } from "@/lib/constants";
import { buyExam, httpStatusResponse } from "@/lib/utils";
import { examPurchaseSchema } from "@/lib/validator.schema";
import { App } from "@/models/app";
import { Exam } from "@/models/exam";
import { Transaction } from "@/models/transactions";
import { User } from "@/models/users";
import type { transaction } from "@/types";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction(); // Start transaction at the beginning

    // Parse and validate request body
    const requestBody = await request.json();
    const validatedData = examPurchaseSchema.safeParse(requestBody);

    if (!validatedData.success) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(400, validatedData.error.message),
        { status: 400 }
      );
    }

    const { examId, quantity, pin } = validatedData.data;

    // Get user session
    const _session = await getServerSession();
    if (!_session?.user?.email) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        httpStatusResponse(401, "Unauthorized: User not authenticated"),
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Find user
    const user = await User.findOne({
      "auth.email": _session.user.email,
    }).select("+auth.transactionPin");
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(httpStatusResponse(404, "User not found"), {
        status: 404,
      });
    }

    const app = await App.findOne({});

    // Check if system is under maintenance
    await app?.systemIsunderMaintainance();

    // Verify transaction PIN
    await user?.verifyTransactionPin(pin);

    // Find exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(httpStatusResponse(404, "Exam not found"), {
        status: 404,
      });
    }

    // Check if transaction type is enabled
    await app?.isTransactionEnable("exam");

    // Check transaction limit
    await app?.checkTransactionLimit(exam.amount);

    // Calculate total amount
    const totalAmount = exam.amount * quantity;

    // Verify user balance
    await user?.verifyUserBalance(totalAmount);

    // Generate transaction reference
    const tx_ref = new mongoose.Types.ObjectId().toString();

    // Process exam purchase
    const res = await buyExam(exam.examId, tx_ref, quantity);

    // Create transaction record
    const trxPayload: transaction = {
      accountId: res["request-id"],
      amount: totalAmount,
      meta: {
        ...res,
      },
      note: res.message,
      paymentMethod: "ownAccount",
      status: res.status === "success" ? "success" : "pending",
      tx_ref,
      type: "exam",
      user: user._id,
    };

    // Update user balance
    user.balance -= totalAmount;

    // Create transaction
    const transaction = new Transaction(trxPayload);

    // Save all changes in parallel
    await Promise.all([
      transaction.save({ session }),
      user.save({ session, validateModifiedOnly: true }),
    ]);

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    const { error } = await resend.emails.send({
      from: configs.appName,
      to: user.auth.email,
      subject: "Your Exam Access Token",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Your Exam Access Token</h1>
          <p>Hello ${user.fullName.split(" ")[0] || "there"},</p>
          <p>Thank you for your purchase. Below is your exam access token:</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <strong style="font-size: 24px; letter-spacing: 2px;">${
              res.pin
            }</strong>
          </div>
          <p>Please keep this token secure. You'll need it to access your exam.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The Exam Team</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      httpStatusResponse(200, "Exam purchased successfully", {
        examToken: res.pin,
        transactionId: tx_ref,
      }),
      { status: 200 }
    );
  } catch (error) {
    // Ensure transaction is aborted on error
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error("Error aborting transaction:", abortError);
    }

    session.endSession();

    console.error("Exam purchase error:", error);

    return NextResponse.json(
      httpStatusResponse(
        500,
        error instanceof Error ? error.message : "An unexpected error occurred"
      ),
      { status: 500 }
    );
  }
}
