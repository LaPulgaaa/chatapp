import { prisma } from "@/packages/prisma/prisma_client";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest,{ params }:{ params: { slug: string }}){
    const conc_id = params.slug;
    const token = await getToken({ req });
    const {last_msg_id}:{ last_msg_id: number } = await req.json();

    if(token == null){
        return Response.json({
            message: "UNAUTHORISED_ACCESS"
        },{ status: 401 });
    }

    try{
        const dms = await prisma.directMessage.findMany({
            where: {
                connectionId: conc_id,
                id: {
                    gt: last_msg_id
                },
                deleted: false,
            },
            select: {
                id: true,
                createdAt: true,
                content: true,
                sendBy:{
                    select: {
                        username: true,
                    }
                }
            }
            
        });

        return Response.json({
            message: "SUCCESS",
            data: dms,
        },{ status: 200 });
    }catch(err){
        console.log(err);
        return Response.json({
            message: "SERVER_ERROR",
        },{ status: 500 });
    }
}