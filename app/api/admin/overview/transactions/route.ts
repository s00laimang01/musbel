import { getTransactionsWithUserDetails } from "@/lib/server-utils";
import { httpStatusResponse } from "@/lib/utils";
import { transactionStatus } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams;
    const limit = Number(q.get("limit") || 18);
    const status = q.get("status") as transactionStatus;
    const page = Number(q.get("page") || 1);
    const search = q.get("search") || undefined;
    const sortBy = q.get("sortBy") || undefined;
    const sortOrder = Number(q.get("sortOrder")) || -1;
    const today = Boolean(q.get("today") === "true") || undefined;

    console.log({ sortOrder, sortBy, today });

    const transactions = await getTransactionsWithUserDetails(
      {
        sortOrder: Number(sortOrder) as -1 | 1,
        limit,
        status,
        page,
        sortBy,
        today,
      },
      { search }
    );

    return NextResponse.json(httpStatusResponse(200, undefined, transactions), {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
