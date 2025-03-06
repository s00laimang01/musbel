import { httpStatusResponse, verifyTransactionWithTxRef } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const tx_ref = request.nextUrl.searchParams.get("tx_ref");

    const transaction = await verifyTransactionWithTxRef(tx_ref!);

    return NextResponse.json(
      httpStatusResponse(200, "Transaction verified", transaction),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
