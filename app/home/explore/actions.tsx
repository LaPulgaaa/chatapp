"use server";

import { prisma } from "../../../packages/prisma/prisma_client";

export async function search_by_username(
  cred: string,
  host_username: string,
  host_name?: string | null,
) {
  try {
    const possible_members = await prisma.member.findMany({
      where: {
        OR: [
          {
            username: {
              contains: cred,
              not: host_username,
              mode: "insensitive",
            },
          },
          {
            name: {
              contains: cred,
              not: host_name,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        username: true,
        avatarurl: true,
        about: true,
        name: true,
      },
      take: 10,
    });

    return possible_members;
  } catch (err) {
    console.log(err);
    return [];
  }
}
