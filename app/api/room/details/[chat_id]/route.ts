import type { NextRequest } from "next/server";

import { prisma } from "@/packages/prisma/prisma_client";
import type { RoomType } from "@/packages/valibot";

export async function PUT(
  req: NextRequest,
  { params }: { params: { chat_id: string } },
) {
  const chat_id = params.chat_id;
  const updated_form_data: RoomType = await req.json();
  try {
    await prisma.chat.update({
      where: {
        id: chat_id,
      },
      data: {
        name: updated_form_data.name,
        description: updated_form_data.description,
      },
    });

    return Response.json(
      {
        message: "SUCCESS",
      },
      { status: 200 },
    );
  } catch (err) {
    console.log(err);
    return Response.json(
      {
        message: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    );
  }
}
