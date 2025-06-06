import assert from "minimalistic-assert";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { prisma } from "@/packages/prisma/prisma_client";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const search_username = params.slug;
  const token = await getToken({ req });

  if (token === null)
    return Response.json(
      {
        message: "UNAUTHORISED_ACCESS",
      },
      { status: 404 },
    );

  try {
    const username: string = token.username;
    const search_result = await prisma.member.findUnique({
      where: {
        username: search_username,
      },
      select: {
        avatarurl: true,
        about: true,
        name: true,
        status: true,
        favorite: true,
      },
    });

    assert(search_result !== null);

    const friendship_status = await prisma.friendShip.findUnique({
      where: {
        fromId_toId: {
          fromId: username,
          toId: search_username,
        },
      },
      select: {
        connectionId: true,
        messageFrom: true,
        blocked: true,
        id: true,
      },
    });

    if (friendship_status === null) {
      const data = {
        profile_info: search_result,
        is_friend: false,
      };

      return Response.json({
        message: "SUCCESS",
        raw_data: data,
      });
    }

    const unfiltered_msgs = await prisma.directMessage.findMany({
      where: {
        connectionId: friendship_status.connectionId,
        deleted: false,
        NOT: {
          deleteFor: {
            contains: username,
          },
        },
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
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

    const messages = unfiltered_msgs.map((msg) => {
      return {
        ...msg,
        starred: msg.starred.includes(username),
      };
    });

    const data = {
      profile_info: search_result,
      is_friend: true,
      friendship_data: { ...friendship_status, messages, is_active: false },
    };

    return Response.json(
      {
        message: "SUCCESS",
        raw_data: data,
      },
      { status: 200 },
    );
  } catch (err) {
    console.log(err);
    return Response.json(
      {
        message: "SERVER ERROR",
      },
      { status: 500 },
    );
  }
}
