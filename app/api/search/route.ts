import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { prisma } from "@/packages/prisma/prisma_client";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (token === null)
    return Response.json({ msg: "UNAUTHORIZED" }, { status: 401 });

  try {
    const resp = req.nextUrl.searchParams;
    const query = resp.get("query");
    const username = token.username;
    const user_id = token.id!;
    const name = token.name;

    if (query === null)
      return Response.json(
        {
          msg: "Query parameter not provided.",
          data: {
            dm: [],
            chat: [],
            profile: [],
          },
        },
        { status: 200 },
      );

    const profiles = await prisma.member.findMany({
      where: {
        OR: [
          {
            username: {
              contains: query,
              not: username,
              mode: "insensitive",
            },
          },
          {
            name: {
              contains: query,
              not: name,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        avatarurl: true,
        about: true,
        name: true,
      },
      take: 10,
    });

    const dms = await prisma.$queryRaw`
            SELECT dm.*, f."toId", f."fromId",
                ts_rank(to_tsvector('english',dm.content), plainto_tsquery('english',${query})) as rank
            FROM "DirectMessage" dm
            INNER JOIN "FriendShip" f ON dm."friendshipId" = f.id
            WHERE (f."toId" = ${username} OR f."fromId" = ${username})
            AND dm.deleted = false
            AND to_tsvector('english', dm.content) @@ plainto_tsquery('english', ${query})
            ORDER BY rank DESC, dm."createdAt" DESC
            LIMIT 20
        `;

    const chat_msgs = await prisma.$queryRaw`
            SELECT m.*, c.name as "chatName", mem.username as "sender",
                ts_rank(to_tsvector('english', m.content), plainto_tsquery('english', ${query})) as rank
            FROM "Message" m
            INNER JOIN "Chat" c ON m."chatId" = c.id
            INNER JOIN "Directory" d ON c.id = d."chat_id"
            LEFT JOIN "Member" mem ON m."memberId" = mem.id
            WHERE d."userId" = ${user_id}
            AND m.deleted = false
            AND to_tsvector('english', m.content) @@ plainto_tsquery('english', ${query})
            ORDER BY rank DESC, m."createdAt" DESC
            LIMIT 20
        `;

    return Response.json(
      {
        msg: "SUCCESS",
        data: {
          dm: dms,
          profile: profiles,
          chat: chat_msgs,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.log(err);
    Response.json(
      {
        msg: err,
      },
      { status: 500 },
    );
  }
}
