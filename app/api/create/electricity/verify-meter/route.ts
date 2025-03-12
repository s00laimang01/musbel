import { httpStatusResponse, verifyMeterNumber } from "@/lib/utils";
import { meterType } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams;

    if (!(q.get("meterNumber") && q.get("disco") && q.get("meterType"))) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "MISSING_REQUIRED_PARAMETER: please provide all required information."
        ),
        { status: 400 }
      );
    }

    const res = await verifyMeterNumber(
      Number(q.get("meterNumber")),
      Number(q.get("disco")),
      q.get("meterType") as meterType
    );

    return NextResponse.json(
      httpStatusResponse(200, "Meter verified successfully", res),
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
