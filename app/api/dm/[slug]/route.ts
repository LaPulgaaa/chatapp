import { NextRequest } from "next/server";
import { prisma } from "@/packages/prisma/prisma_client";
import assert from "minimalistic-assert";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest, { params }: { params: {slug: string}}){
    const search_username = params.slug;
    const token = await getToken({ req });

    if(token === null)
        return Response.json({
            message: "UNAUTHORISED_ACCESS"
        },{ status: 404 });

    try{
        //@ts-ignore
        const username:string = token.username;
        const search_result = await prisma.member.findUnique({
            where: {
                username: search_username
            },
            select: {
                avatarurl: true,
                about: true,
                name: true,
                status: true,
                favorite: true,
            }
        });

        assert(search_result !== null);

        const friendship_status = await prisma.friendShip.findUnique({
            where: {
                fromId_toId: {
                    fromId: username,
                    toId: search_username,
                }
            },
            select: {
                connectionId: true,
                messageFrom: true,
                blocked: true,
                id: true,
            }

        });

        if(friendship_status === null){
            const data = {
                profile_info: search_result,
                is_friend: false,
            }

            return Response.json({
                message: 'SUCCESS',
                raw_data: data,
            });
        }

        const messages = await prisma.directMessage.findMany({
            where: {
                OR: [
                    {
                        connectionId: friendship_status.connectionId,
                        deleted: false,
                        NOT: {
                            deleteFor: username
                        }
                    },
                    {
                        connectionId: friendship_status.connectionId,
                        deleted: false,
                        deleteFor: null
                    }
                ]
            },
            select: {
                id: true,
                content: true,
                createdAt: true,
                sendBy: {
                    select: {
                        username: true,
                    }
                },
                deleteFor: true
            }
        })

        const data = {
            profile_info: search_result,
            is_friend: true,
            friendship_data: {...friendship_status, messages, is_active: false},
        };

        return Response.json({
            message: "SUCCESS",
            raw_data: data,
        },{ status: 200 });

    }catch(err){
        console.log(err);
        return Response.json({
            message: 'SERVER ERROR'
        },{ status: 500 });
    }
}