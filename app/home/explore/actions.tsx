"use server";

import { prisma } from "../../../packages/prisma/prisma_client";

export async function search_by_username(
  cred: string,
  host_username: string,
  host_name?: string | null,
) {
  try {
    const search_word = cred.trim();

    const search_results = await prisma.member.findMany({
      where: {
        OR: [
          {
            username: {
              contains: search_word,
              not: host_username,
              mode: "insensitive",
            },
          },
          {
            name: {
              contains: search_word,
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

    return search_results;
  } catch (err) {
    console.log(err);
    return [];
  }
}
