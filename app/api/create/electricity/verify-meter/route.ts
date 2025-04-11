import { connectToDatabase } from "@/lib/connect-to-db";
import { BuyVTU } from "@/lib/server-utils";
import { httpStatusResponse } from "@/lib/utils";
import { App } from "@/models/app";
import { Electricity } from "@/models/electricity";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const buyVtu = new BuyVTU();

  try {
    const q = request.nextUrl.searchParams;

    const electricityId = q.get("electricityId") as unknown as string;
    const meterNumber = q.get("meterNumber") as unknown as string;

    if (!(meterNumber && electricityId)) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "MISSING_REQUIRED_PARAMETER: please provide all required information."
        ),
        { status: 400 }
      );
    }

    await connectToDatabase();

    await buyVtu.startSession();

    const app = await App.findOne({}).select("+buyVtu").session(buyVtu.session);

    const electricity = await Electricity.findById(electricityId).session(
      buyVtu.session
    );

    if (!electricity) {
      return NextResponse.json(
        httpStatusResponse(404, "Electricity not found"),
        { status: 404 }
      );
    }

    const accessToken = await app?.refreshAccessToken();

    buyVtu.setAccessToken = accessToken!;

    await buyVtu.validateMeterNo(electricity.discoId, meterNumber);

    await buyVtu.commitSession();

    return NextResponse.json(
      httpStatusResponse(
        200,
        "Meter verified successfully",
        buyVtu.validateMeterResponse
      ),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    await buyVtu.endSession();
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
