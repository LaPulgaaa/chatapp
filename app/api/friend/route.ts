import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/packages/prisma/prisma_client";
import type { PrivateChat } from "@/packages/zod";

type DirectMessagesServer = (Omit<PrivateChat, "lastmsgAt"> & {
    lastmsgAt: Date,
})[]

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
                connectionId: true,
                blocked: true,
                lastmsgAt: true,
                messageFrom: true,
                id: true,
            }
        });

        let friendships_with_last_dm:DirectMessagesServer = [];

        await Promise.all(resp.map(async(frnd) => {
            try{
                const message = await prisma.directMessage.findFirst({
                    where: {
                        connectionId: frnd.connectionId,
                        createdAt: {
                            gte: frnd.messageFrom
                        },
                    },
                    select: {
                        content: true,
                        sendBy: {
                            select: {
                                username: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }

                });

                friendships_with_last_dm.push({
                    ...frnd,
                    messages: message !== null ? [message] : [],
                });

            }catch(err){
                console.log(err);
                friendships_with_last_dm.push({
                    ...frnd,
                    messages: [],
                })
            }
            })
        )

        return Response.json({
            message: "SUCCESS",
            raw_data: friendships_with_last_dm,
        },{ status: 200 });
    }catch(err){
        console.log(err);
        return Response.json({
            message: "SERVER ERROR",
        },{ status: 500 })
    }
}