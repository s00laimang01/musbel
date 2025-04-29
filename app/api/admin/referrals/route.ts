import { connectToDatabase } from "@/lib/connect-to-db";
import { httpStatusResponse } from "@/lib/utils";
import { Referral } from "@/models/referral";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all referrals with pagination and search
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(httpStatusResponse(401, "Unauthorized"), {
        status: 401,
      });
    }

    await connectToDatabase();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Build base search query for referral code
    const baseSearchQuery = search
      ? {
          referralCode: { $regex: search, $options: "i" },
        }
      : {};

    // Get total count
    const totalReferrals = await Referral.countDocuments(baseSearchQuery);

    // Fetch referrals with user details
    const referrals = await Referral.aggregate([
      // Match referrals based on referral code
      { $match: baseSearchQuery },

      // Convert string IDs to ObjectIds if needed
      {
        $addFields: {
          referreeObjectId: {
            $cond: {
              if: { $eq: [{ $type: "$referree" }, "string"] },
              then: { $toObjectId: "$referree" },
              else: "$referree",
            },
          },
        },
      },

      // Lookup the user who was referred
      {
        $lookup: {
          from: "users",
          let: { referreeId: "$referreeObjectId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$referreeId"] },
              },
            },
            {
              $project: {
                fullName: 1,
                "auth.email": 1,
                isEmailVerified: 1,
                _id: 1,
              },
            },
          ],
          as: "referreeDetails",
        },
      },

      // Unwind the arrays created by $lookup
      {
        $unwind: {
          path: "$referreeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Additional search filter for referree name if search term exists
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { referralCode: { $regex: search, $options: "i" } },
                  {
                    "referreeDetails.fullName": {
                      $regex: search,
                      $options: "i",
                    },
                  },
                ],
              },
            },
          ]
        : []),

      // Group by referral code to count referrals
      {
        $group: {
          _id: "$referralCode",
          referralCount: { $sum: 1 },
          doc: { $first: "$$ROOT" },
        },
      },

      // Restore the original document structure with the count
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$doc", { referralCount: "$referralCount" }],
          },
        },
      },

      // Format the output
      {
        $project: {
          _id: 1,
          referralCode: 1,
          referree: 1,
          user: 1,
          rewardClaimed: 1,
          createdAt: 1,
          updatedAt: 1,
          referreeName: "$referreeDetails.fullName",
          referreeEmail: "$referreeDetails.auth.email",
          isEmailVerified: "$referreeDetails.isEmailVerified",
          referralCount: 1,
        },
      },

      // Sort by newest first
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    return NextResponse.json(
      httpStatusResponse(200, "Referrals fetched successfully", {
        referrals,
        pagination: {
          total: totalReferrals,
          page,
          limit,
          pages: Math.ceil(totalReferrals / limit),
        },
      })
    );
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return NextResponse.json(
      httpStatusResponse(500, "Failed to fetch referrals"),
      { status: 500 }
    );
  }
}

// PATCH: Update referral status (e.g., mark reward as claimed)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(httpStatusResponse(401, "Unauthorized"), {
        status: 401,
      });
    }

    const { referralId, rewardClaimed } = await request.json();

    if (!referralId) {
      return NextResponse.json(
        httpStatusResponse(400, "Referral ID is required"),
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updatedReferral = await Referral.findByIdAndUpdate(
      referralId,
      { rewardClaimed },
      { new: true }
    );

    if (!updatedReferral) {
      return NextResponse.json(httpStatusResponse(404, "Referral not found"), {
        status: 404,
      });
    }

    return NextResponse.json(
      httpStatusResponse(200, "Referral updated successfully", updatedReferral)
    );
  } catch (error) {
    console.error("Error updating referral:", error);
    return NextResponse.json(
      httpStatusResponse(500, "Failed to update referral"),
      { status: 500 }
    );
  }
}

// DELETE: Remove a referral
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(httpStatusResponse(401, "Unauthorized"), {
        status: 401,
      });
    }

    const referralId = request.nextUrl.searchParams.get("referralId");

    if (!referralId) {
      return NextResponse.json(
        httpStatusResponse(400, "Referral ID is required"),
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deletedReferral = await Referral.findByIdAndDelete(referralId);

    if (!deletedReferral) {
      return NextResponse.json(httpStatusResponse(404, "Referral not found"), {
        status: 404,
      });
    }

    return NextResponse.json(
      httpStatusResponse(200, "Referral deleted successfully")
    );
  } catch (error) {
    console.error("Error deleting referral:", error);
    return NextResponse.json(
      httpStatusResponse(500, "Failed to delete referral"),
      { status: 500 }
    );
  }
}
