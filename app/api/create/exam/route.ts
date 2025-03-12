import { httpStatusResponse } from "@/lib/utils";
import { Exam } from "@/models/exam";
import { exam } from "@/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { amount, examId, examType } = (await request.json()) as exam;

    const examPayload: exam = {
      amount,
      examId,
      examType,
    };

    const dataPlan = new Exam(examPayload);

    await dataPlan.save({ validateBeforeSave: true });

    return NextResponse.json(
      httpStatusResponse(201, "Exam successfully created", dataPlan.toObject()),
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(httpStatusResponse(50, (error as Error).message), {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  try {
    const exams = await Exam.find();

    return NextResponse.json(httpStatusResponse(200, "Exams fetched", exams), {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      {
        status: 500,
      }
    );
  }
}
