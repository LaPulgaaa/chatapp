import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { prisma } from "@/packages/prisma/prisma_client";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const conc_id = params.slug;
  const token = await getToken({ req });
  const { last_msg_id }: { last_msg_id: number } = await req.json();

  if (token === null) {
    return Response.json(
      {
        message: "UNAUTHORISED_ACCESS",
      },
      { status: 401 },
    );
  }

  try {
    const username: string = token.username;

    const dms = await prisma.directMessage.findMany({
      where: {
        connectionId: conc_id,
        id: {
          gt: last_msg_id,
        },
        deleted: false,
        NOT: {
          deleteFor: {
            contains: username,
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
        content: true,
        hash: true,
        sendBy: {
          select: {
            username: true,
          },
        },
        deleteFor: true,
        pinned: true,
        starred: true,
      },
    });

    return Response.json(
      {
        message: "SUCCESS",
        data: dms,
      },
      { status: 200 },
    );
  } catch (err) {
    console.log(err);
    return Response.json(
      {
        message: "SERVER_ERROR",
      },
      { status: 500 },
    );
  }
}
