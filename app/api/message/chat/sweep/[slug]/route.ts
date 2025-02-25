import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { prisma } from "@/packages/prisma/prisma_client";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const chat_id = params.slug;
  const { last_msg_id }: { last_msg_id: number } = await req.json();

  const token = await getToken({ req });

  if (token === null) {
    return Response.json(
      {
        message: "UNAUTHORISED_ACCESS",
      },
      { status: 401 },
    );
  }

  try {
    const resp = await prisma.message.findMany({
      where: {
        chatId: chat_id,
        id: {
          gt: last_msg_id,
        },
        deleted: false,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        sender: {
          select: {
            username: true,
            name: true,
          },
        },
      },
    });

    return Response.json(
      {
        message: "SUCCESS",
        raw_data: resp,
      },
      { status: 200 },
    );
  } catch (err) {
    return Response.json(
      {
        message: "SERVER_ERROR",
        err,
      },
      { status: 500 },
    );
  }
}
