import { connectToDatabase } from "@/lib/connect-to-db";
import { httpStatusResponse } from "@/lib/utils";
import { DataPlan } from "@/models/data-plan";
import { dataPlan } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { amount, availability, network, ...rest } =
      (await request.json()) as dataPlan;

    const dataPlanPayload: dataPlan = {
      amount,
      availability,
      network,
      ...rest,
    };

    const dataPlan = new DataPlan(dataPlanPayload);

    await dataPlan.save({ validateBeforeSave: true });

    return NextResponse.json(
      httpStatusResponse(
        201,
        "Data plan successfully created",
        dataPlan.toObject()
      ),
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(httpStatusResponse(50, (error as Error).message), {
      status: 500,
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams;
    const network = q.get("network");
    const planType = q.get("planType");

    let query: Record<any, any> = {};

    await connectToDatabase();

    if (network) {
      query["network"] = network;
    }

    if (planType) {
      query["type"] = planType;
    }

    const dataPlans = await DataPlan.find({ ...query }).sort({
      isPopular: -1,
      amount: 1,
      //planId: 1,
    });

    return NextResponse.json(
      httpStatusResponse(200, "Data plans fetched", dataPlans),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      {
        status: 500,
      }
    );
  }
}
