import { httpStatusResponse } from "@/lib/utils";
import { SystemMessage } from "@/models/message";
import { User } from "@/models/users";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const systemMessage = await SystemMessage.findOne({});

    return NextResponse.json(
      httpStatusResponse(200, undefined, systemMessage),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    const user = await User.findOne({ "auth.email": session?.user?.email });

    if (!user) {
      return NextResponse.json(
        httpStatusResponse(404, "USER_NOT_FOUND: please contact the admin"),
        { status: 404 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        httpStatusResponse(
          401,
          "UNAUTHORIZED_REQUEST: you do not have the right permissions to perform this action"
        )
      );
    }

    const { message, title } = await request.json();

    const systemMessage = await SystemMessage.findOne({});

    if (!systemMessage) {
      const messageId = new mongoose.Types.ObjectId().toString();

      const _message = new SystemMessage({
        message: message,
        messageId: messageId,
        title: title,
      });

      await _message.save();

      return NextResponse.json(httpStatusResponse(201, undefined, _message), {
        status: 201,
      });
    }

    const newSystemMessage = await systemMessage?.updateMessage(message, title);

    return NextResponse.json(
      httpStatusResponse(200, undefined, newSystemMessage),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      httpStatusResponse(500, (error as Error).message),
      { status: 500 }
    );
  }
}
