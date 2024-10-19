import { createClient } from "redis";

import { worker_payload } from "../../packages/zod";
import type { WorkerPayload } from "../../packages/zod";
import { prisma } from "../../packages/prisma/prisma_client";


const client=createClient();

export async function start_worker(){
    console.log("start redis worker")
    try{
        await client.connect();

        try{
            while(true){
                const payload=await client.brPop("message",0);
                const message=worker_payload.parse(JSON.parse(payload?.element ?? ""));
                process_msg(message);
            }
        }catch(err){
            console.log(err);
        }
    }catch(err){
        console.log(err);
        console.log("could not connect redis client.")
    }
}

async function process_msg(message:WorkerPayload){
    try{
        if(message.type === "chat")
        {
            const {createdAt} = await prisma.message.create({
            data:{
                memberId: message.memberId,
                content: message.content,
                chatId: message.chatId,
                createdAt: message.createdAt
            },
            select:{
                createdAt: true
            }
            })
            await prisma.chat.update({
                where:{
                    id: message.chatId
                },
                data:{
                    lastmsgAt: createdAt
                }
            })
        }
        else{
            await prisma.directMessage.create({
                data: {
                    friendshipId: message.friendshipId,
                    connectionId: message.concId,
                    content: message.content,
                    createdAt: message.createdAt,
                    senderId: message.sender,
                },
                select: {
                    friendship: {
                        select: {
                            fromId: true,
                            toId: true,
                        }
                    }
                }
            });

            await prisma.friendShip.updateMany({
                where: {
                    connectionId: message.concId
                },
                data: {
                    lastmsgAt: new Date(message.createdAt)
                }
            })
        }
    }catch(err){
        console.log(err);
    }
}

