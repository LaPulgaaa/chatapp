import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/packages/prisma/prisma_client";
import type { DirectMsg, PrivateChat } from "@/packages/zod";

type DirectMessagesServer = (Omit<PrivateChat, "lastmsgAt" | "messages"> & {
    lastmsgAt: Date,
    messages: DirectMsg[]
})[];

type Friend = {
    id: string;
    to: {
        about: string | null;
        username: string;
        avatarurl: string | null;
        status: string | null;
        name: string | null;
        favorite: string[]
    };
    blocked: boolean;
    lastmsgAt: Date;
    connectionId: string;
    messageFrom: Date;
}


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
                        status: true,
                        name: true,
                        favorite: true,
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
                const message = await prisma.directMessage.findMany({
                    where: {
                        connectionId: frnd.connectionId,
                        createdAt: {
                            gte: frnd.messageFrom
                        },
                    },
                    select: {
                        id: true,
                        createdAt: true,
                        content: true,
                        sendBy: {
                            select: {
                                username: true,
                            }
                        }
                    }
                });

                friendships_with_last_dm.push({
                    ...frnd,
                    messages: message,
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