import { getTransactionsWithUserDetails } from "@/lib/server-utils";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { options, filters } = await request.json();

    // Call the server function with the provided options and filters
    const result = await getTransactionsWithUserDetails(options, filters);

    // Convert transactions to CSV
    const transactions = result.transactions;

    // Define CSV headers
    const headers = [
      "Transaction ID",
      "Customer Name",
      "Customer Email",
      "Amount",
      "Status",
      "Date",
    ];

    // Create CSV content
    let csvContent = headers.join(",") + "\n";

    // Add transaction rows
    transactions.forEach((transaction: any) => {
      const row = [
        transaction.transaction_id,
        `"${transaction.userfullName.replace(/"/g, '""')}"`, // Escape quotes in names
        `"${transaction.userEmail.replace(/"/g, '""')}"`,
        transaction.amount,
        transaction.status,
        transaction.createdAt,
      ];
      csvContent += row.join(",") + "\n";
    });

    // Return CSV as a blob
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="transactions-export-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Error in transactions export API:", error);
    return NextResponse.json(
      {
        error: "Failed to export transactions",
        success: false,
      },
      { status: 500 }
    );
  }
}
