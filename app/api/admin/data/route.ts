import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { DataPlan } from "@/models/data-plan";
import { httpStatusResponse } from "@/lib/utils";
import { createDataPlanSchema } from "@/lib/validator.schema";
import { z } from "zod";
import { connectToDatabase } from "@/lib/connect-to-db";
import { getServerSession } from "next-auth";
import { User } from "@/models/users";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const network = searchParams.get("network");
    const search = searchParams.get("search");

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const popularPlans = await DataPlan.find({ isPopular: true }).limit(5);

    // Build filter for all data plans
    const filter: any = {};

    if (network) {
      filter.network = network;
    }

    if (search) {
      filter.$or = [
        { data: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
      ];
    }

    // Count total documents for pagination
    const total = await DataPlan.countDocuments(filter);

    // Fetch paginated data plans
    const dataPlans = await DataPlan.find(filter)
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      httpStatusResponse(200, undefined, {
        featuredPlans: popularPlans,
        dataPlans,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching data plans:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    const user = await User.findOne({ "auth.email": session?.user?.email });

    if (!user || user.role !== "admin") {
      return NextResponse.json(httpStatusResponse(401, "Unauthorized"), {
        status: 401,
      });
    }

    // Connect to MongoDB if not already connected
    await connectToDatabase();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createDataPlanSchema.parse(body);

    // Check if a plan with the same planId already exists
    //    const existingPlan = await DataPlan.findOne({
    //      planId: validatedData.planId,
    //    });
    //
    //    if (existingPlan) {
    //      return NextResponse.json(
    //        { success: false, message: "A plan with this ID already exists" },
    //        { status: 400 }
    //      );
    //    }

    // Create new data plan
    const newDataPlan = new DataPlan(validatedData);
    await newDataPlan.save();

    return NextResponse.json(
      httpStatusResponse(201, "Data plan created successfully", newDataPlan),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating data plan:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(httpStatusResponse(400, error.message), {
        status: 400,
      });
    }

    // Handle mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(httpStatusResponse(400, error.message), {
        status: 400,
      });
    }

    return NextResponse.json(httpStatusResponse(500, "Internal Server Error"), {
      status: 500,
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const dataId = request.nextUrl.searchParams.get("dataId");

    console.log({ dataId });

    const deletedData = await DataPlan.findByIdAndDelete(dataId);

    if (!deletedData) {
      return NextResponse.json(httpStatusResponse(404, "Data plan not found"), {
        status: 404,
      });
    }

    return NextResponse.json(
      httpStatusResponse(200, "Data plan deleted successfully"),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(httpStatusResponse(500, "Internal Server Error"), {
      status: 500,
    });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { _id, ...updates } = await request.json();

    console.log({ updates });

    await connectToDatabase();

    const updatedPlan = await DataPlan.findByIdAndUpdate(
      _id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      httpStatusResponse(200, "Plan updated", updatedPlan),
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
