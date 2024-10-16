import { NextRequest } from "next/server";

import { prisma } from "@/packages/prisma/prisma_client";

import { getToken } from "next-auth/jwt";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest){
    const { roomId } = await req.json();
    const token = await getToken({ req });

    if(token === null)
        return Response.json({
            msg: "Unauthorised access"
        },{ status: 401 });
    
    try{
        // @ts-ignore
        const memberId: string = token.id;
        const room=await prisma.chat.findUnique({
            where:{
                id:roomId
            }
        })
        if(room!=null)
        {
            const room_opcode=await prisma.message.create({
                data:{
                    content:`chat_${memberId}`,
                    memberId,
                    chatId:room.id,
                    deleted: true
                }
            })
            const directory=await prisma.directory.create({
                data:{
                    userId:memberId,
                    chat_id:roomId,
                    after:new Date()
                }
            })

            revalidateTag("rooms");
            
            return Response.json({
                msg:"Joined new room",
                raw_data:room,
                raw_opcode:room_opcode,
                directory_id:directory.id
            }, { status: 200 })
        }
        else{
            Response.json({
                msg:"Room not found"
            }, {status: 404 })
        }
    }catch(err)
    {
        return Response.json({
            msg:err
        },{ status: 500 })
    }
}