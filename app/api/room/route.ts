import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { prisma } from "@/packages/prisma/prisma_client";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (token === null)
    return Response.json({ message: "unauthorized" }, { status: 401 });

  try {
    const memberId = token.id;
    const username = token.username;
    const message_subscribed_rooms = await prisma.message.findMany({
      where: {
        content: `chat_${memberId}`,
        deleted: true,
      },
      select: {
        chat: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            lastmsgAt: true,
            deleted: true,
            messages: {
              where: {
                deleted: false,
                NOT: {
                  deletedFor: {
                    contains: username,
                  },
                },
              },
              select: {
                id: true,
                content: true,
                sender: {
                  select: {
                    username: true,
                    name: true,
                  },
                },
                createdAt: true,
                pinned: true,
                starredBy: {
                  where: {
                    member: {
                      username: username,
                    },
                  },
                  select: {
                    msgId: true,
                  },
                },
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    const raw_data = message_subscribed_rooms.map((room) => {
      const filtered_msgs = room.chat.messages.map((msg) => {
        const { starredBy, ...filtered_msg } = msg;
        return {
          ...filtered_msg,
          starred: msg.starredBy.length > 0,
        };
      });
      return { ...room.chat, conn_id: room.id, messages: filtered_msgs };
    });

    return Response.json(
      {
        msg: "Success",
        raw_data,
      },
      { status: 200 },
    );
  } catch (err) {
    return Response.json(
      {
        msg: "Internal Server Error",
        err,
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  const { name, description } = await req.json();
  if (token === null) {
    return Response.json(
      {
        msg: "Unauthorized",
      },
      { status: 401 },
    );
  }

  try {
    const memberId: string = token.id;
    const [new_room, chat_opcode] = await prisma.$transaction(async (tx) => {
      const new_room = await tx.chat.create({
        data: {
          name,
          description,
        },
      });
      await tx.directory.create({
        data: {
          chat_id: new_room.id,
          userId: memberId,
          after: new_room.createdAt,
        },
      });
      const chat_opcode = await tx.message.create({
        data: {
          content: `chat_${memberId}`,
          chatId: new_room.id,
          memberId: memberId,
          deleted: true,
        },
      });
      return [new_room, chat_opcode];
    });
    return Response.json(
      {
        msg: "CHAT_CREATED_SUCCESSFULLY",
        chat: { ...new_room, conn_id: chat_opcode.id },
      },
      { status: 201 },
    );
  } catch (err) {
    console.log(err);
    return Response.json(
      {
        msg: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
