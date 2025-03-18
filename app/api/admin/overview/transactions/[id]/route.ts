import { type NextRequest, NextResponse } from "next/server";
import { getTransactionByIdWithUserDetails } from "@/lib/server-utils";
import { httpStatusResponse } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Transaction ID is required",
          success: false,
        },
        { status: 400 }
      );
    }

    // Get transaction with user details
    const transaction = await getTransactionByIdWithUserDetails(id);

    console.log({ transaction });

    if (!transaction) {
      return NextResponse.json(
        httpStatusResponse(404, "Transaction Not Found"),
        { status: 404 }
      );
    }

    return NextResponse.json(httpStatusResponse(200, undefined, transaction), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching transaction by ID:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch transaction details",
        success: false,
      },
      { status: 500 }
    );
  }
}
