import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/packages/prisma/prisma_client";

export async function GET(req: NextRequest){
    const token = await getToken({ req });

    if(token === null)
        return Response.json({
            message: "UNAUTHORISED",
        },{ status: 401 });

    //@ts-ignore
    const username:string = token.username!;

    try{
        const resp = await prisma.friendShip.findMany({
            where: {
                fromId: username,
            },
            select: {
                to: {
                    select: {
                        username: true,
                        avatarurl: true,
                        about: true,
                    },
                },
                blocked: true,
                lastmsgAt: true,
                messages: {
                    take: 1,
                    where: {
                        deleted: false,
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    select: {
                        content: true,
                        createdAt: true,
                        sendBy: {
                            select: {
                                username: true,
                            }
                        }
                    }
                },
                id: true,
            }
        });

        return Response.json({
            message: "SUCCESS",
            raw_data: resp,
        },{ status: 200 });
    }catch(err){
        console.log(err);
        return Response.json({
            message: "SERVER ERROR",
        },{ status: 500 })
    }
}