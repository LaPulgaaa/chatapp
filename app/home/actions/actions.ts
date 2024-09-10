'use server'

import { prisma } from "../../../packages/prisma/prisma_client"

export default async function getSubscribedRooms(memberId: string | undefined){
    if(memberId === undefined){
        return undefined;
    }
    try{
        let joined_rooms=[];
        const message_subscribed_rooms=await prisma.message.findMany({
            where:{
                content:`chat_${memberId}`,
                deleted:true
            },
            select:{
                chat: true,
                id: true
            }
        })
        let raw_data = message_subscribed_rooms.map((room)=>{
            return {
                ...room.chat,
                conn_id: room.id,
                createdAt: room.chat.createdAt.toUTCString(),
                lastmsgAt: room.chat.lastmsgAt.toUTCString()
            };
        })
        return raw_data;
    }catch(err)
    {
        console.log(err);
        return undefined;
    }
}