import { getChartData } from "@/lib/server-utils";
import { httpStatusResponse } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const chartData = await getChartData();

    return NextResponse.json(httpStatusResponse(200, undefined, chartData), {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
