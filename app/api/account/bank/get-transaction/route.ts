import { httpStatusResponse } from "@/lib/utils";
import { Transaction } from "@/models/transactions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams;
    const tx_ref = q.get("tx_ref");

    const transaction = await Transaction.findOne({
      tx_ref,
      status: "pending",
      "meta.expirationTime": { $gte: new Date().toISOString() },
    });

    return NextResponse.json(httpStatusResponse(200, "Success", transaction), {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
