import { connectToDatabase } from "@/lib/connect-to-db";
import { httpStatusResponse } from "@/lib/utils";
import { Referral } from "@/models/referral";
import { findUserByEmail } from "@/models/users";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(httpStatusResponse(401, "Unauthorized"), {
        status: 401,
      });
    }

    // Get search query from URL if present
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get("search") || "";

    await connectToDatabase();

    const user = await findUserByEmail(session.user.email!, {
      throwOn404: true,
      includePassword: false,
    });

    // Build the match condition
    const matchCondition: any = { referralCode: user?.refCode };

    const totalReferrals = await Referral.countDocuments(matchCondition);

    // Use aggregation to join with the users collection and get full names
    const referrals = await Referral.aggregate([
      // Match referrals for this user
      { $match: matchCondition },

      // Debug: Add a stage to see what referrals are being found
      {
        $addFields: {
          debug_referree: { $toString: "$referree" }, // Convert ObjectId to string for debugging
        },
      },

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

      // Lookup the user who was referred (to get their full name)
      {
        $lookup: {
          from: "users", // The users collection name
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

      // Unwind the arrays created by $lookup (convert from array to object)
      {
        $unwind: {
          path: "$referreeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Apply search filter if provided
      ...(searchTerm
        ? [
            {
              $match: {
                $or: [
                  {
                    "referreeDetails.fullName": {
                      $regex: searchTerm,
                      $options: "i",
                    },
                  },
                  { referralCode: { $regex: searchTerm, $options: "i" } },
                ],
              },
            },
          ]
        : []),

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
          debug_referree: 1, // Include for debugging
          referreeName: "$referreeDetails.fullName",
          referreeEmail: "$referreeDetails.auth.email",
          isEmailVerified: "$referreeDetails.isEmailVerified",
        },
      },

      // Sort by newest first
      { $sort: { createdAt: -1 } },
    ]);

    return NextResponse.json(
      httpStatusResponse(200, "Success", { referrals, totalReferrals }),
      {
        status: 200,
      }
    );
  } catch (err: any) {
    console.error("Error fetching referrals:", err);
    return NextResponse.json(
      httpStatusResponse(500, err?.message || "Internal server error", {}),
      {
        status: 500,
      }
    );
  }
}
