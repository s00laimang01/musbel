import { httpStatusResponse } from "@/lib/utils";
import { Electricity } from "@/models/electricity";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const electricityPlans = await Electricity.find({});

    return NextResponse.json(
      httpStatusResponse(200, "Data plans fetched", electricityPlans),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      {
        status: 500,
      }
    );
  }
}
