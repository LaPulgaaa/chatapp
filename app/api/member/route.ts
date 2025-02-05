import { prisma } from "@/packages/prisma/prisma_client";
import { getToken } from "next-auth/jwt";
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (token === null)
    return Response.json(
      {
        msg: "Unauthorised Access",
      },
      { status: 401 },
    );

  try {
    const resp = await prisma.member.findUnique({
      where: {
        email: token.email!,
      },
      select: {
        username: true,
        name: true,
        avatarurl: true,
        about: true,
        status: true,
        favorite: true,
      },
    });

    if (resp === null) {
      return Response.json(
        {
          msg: "Unavailable data",
        },
        { status: 404 },
      );
    }

    return Response.json({
      msg: "Success",
      raw_data: resp,
    });
  } catch (err) {
    console.log(err);
    return Response.json(
      {
        msg: "Internal Server Error",
        err,
      },
      { status: 500 },
    );
  }
}

type UpdateProfileDetails = {
  username: string;
  name: string;
  about: string;
  avatarurl: string;
  status: string;
  favorite: string[];
};

export async function PATCH(req: NextRequest) {
  const form_body: UpdateProfileDetails = await req.json();
  const token = await getToken({ req });

  if (token === null)
    return Response.json(
      {
        message: "Unauthorized access",
      },
      { status: 401 },
    );

  try {
    const resp = await prisma.member.update({
      where: {
        email: token.email!,
      },
      data: {
        username: form_body.username,
        name: form_body.name,
        about: form_body.about,
        status: form_body.status,
        avatarurl: form_body.avatarurl,
        favorite: form_body.favorite,
      },
    });

    revalidateTag("profile");

    return Response.json(
      {
        message: "Succesfully Updated",
        data: resp,
      },
      { status: 200 },
    );
  } catch (err) {
    console.log(err);
    return Response.json(
      {
        message: "Error, Could not update profile.",
      },
      { status: 500 },
    );
  }
}
