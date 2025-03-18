import { type NextRequest, NextResponse } from "next/server";
import type { appProps } from "@/types";
import { connectToDatabase } from "@/lib/connect-to-db";
import { App } from "@/models/app";
import { httpStatusResponse } from "@/lib/utils";

// GET handler to retrieve settings
export async function GET() {
  try {
    await connectToDatabase();

    // Find settings or create default if none exists
    let settings = await App.findOne({});

    if (!settings) {
      settings = await App.create({});
    }

    return NextResponse.json(httpStatusResponse(200, undefined, settings), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST handler to update settings
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();

    // Find settings or create default if none exists
    let settings = await App.findOne({});

    if (!settings) {
      settings = await App.create(body);
    } else {
      // Update settings with new values
      Object.keys(body).forEach((key) => {
        if (!settings) return;
        if (key in settings) {
          // @ts-ignore
          settings[key as keyof appProps] = body[key];
        }
      });

      await settings.save();
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
