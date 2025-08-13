import { httpStatusResponse } from "@/lib/utils";
import { Transaction } from "@/models/transactions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams;
    const tx_ref = q.get("tx_ref");
    const useExpirationDate = q.get("useExpirationDate") || true;
    const status = q.get("status");

    let query: Record<string, any> = {};

    if (useExpirationDate !== "false") {
      query["meta.expirationTime"] = { $gte: new Date().toISOString() };
    }

    if (status) {
      query["status"] = status;
    }

    const transaction = await Transaction.findOne({
      $or: [{ tx_ref }, { "meta.transactionRef": tx_ref }],
      ...query,
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
