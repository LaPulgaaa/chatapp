import { NextRequest } from "next/server";

import { prisma } from "@/packages/prisma/prisma_client";

export async function GET(req: NextRequest, {params}:{params: {chat_id: string}}){
    const room_id = params.chat_id;
    try{
        const resp = await prisma.chat.findUnique({
            where:{
                id: room_id
            },
            select: {
                name: true,
                discription: true,
                createdAt: true
            }
        });
        if(resp === null){
            return Response.json({
                msg: "Not successful"
            },{ status: 200 });
        }

        return Response.json({
            msg: "success",
            raw_data: resp,
        },{ status: 200 });
    }catch(err){
        return Response.json({
            msg: "Could not fetch details",
            err: err
        },{ status: 500 })
    }
}