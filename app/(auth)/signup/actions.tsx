"use server";

import { prisma } from "@/packages/prisma/prisma_client";

type UserSignupCreds = {
  email: string;
  password: string;
  username: string;
};

export async function create_user(credentials: UserSignupCreds) {
  try {
    const resp = await prisma.member.create({
      data: {
        email: credentials.email,
        password: credentials.password,
        username: credentials.username,
      },
      select: {
        email: true,
        password: true,
      },
    });

    return resp;
  } catch (err) {
    console.log(err);
  }
}
