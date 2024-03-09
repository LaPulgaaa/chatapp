import express from 'express';
import { PrismaClient } from '@prisma/client';
import type { ChatReponse } from '@/packages/zod';

const router=express.Router();
const prisma=new PrismaClient();

type CreateRoomSchema={
    name:string,
    discription:string,
    memberId:string
}

router.get("/allChats",async(req,res)=>{
    try{
        const chats=prisma.chat.findMany({});
        res.status(200).json({
            msg:"This is a complete list of rooms.",
            data:chats
        })
    }catch(err)
    {
        console.log(err);
        res.status(400).send("Error fetching rooms.")
    }
})

router.get("/subscribedChats/:memberId",async(req,res)=>{
    const {memberId}=req.params;
    console.log(memberId)
    try{
        let joined_rooms=[];
        const message_subscribed_room=await prisma.message.findMany({
            where:{
                content:`chat_${memberId}`
            },
            include:{
                chat:true
            }
        })
        // 84125d60-ad70-43bc-8607-78359026bb67
        console.log(message_subscribed_room);
        for(let i=0;i<message_subscribed_room.length;i++){
            joined_rooms.push(message_subscribed_room[i].chat)
        }
        res.status(200).json({
            msg:"subscribed room found",
            raw_data:joined_rooms
        })
    }catch(err)
    {
        res.status(400).send("Server could not find out your rooms!")
    }
    
})

router.post("/createChat",async(req,res)=>{
    //The Message Schema serves as relational schema b/w Member and 
    // Chat schema. We create chat table and the create a message row
    // with a certain message to link Member and Chat model together 
    const {name,discription,memberId}:CreateRoomSchema=req.body;
    try
    {
        const new_room=await prisma.chat.create({
        data:{
            name,
            discription
        }
        })
        console.log(new_room);
        // this "opcode" creates a link b/w chat model and member model
        const chat_opcode=await prisma.message.create({
            data:{
                content:`chat_${memberId}`,
                chatId:new_room.id,
                memberId:memberId
                
            }
        })
        console.log(chat_opcode);
        res.status(201).json({
            msg:"created a new room",
            created_chat:new_room,
            created_opcode:chat_opcode
        })
    }catch(err)
    {
        console.log(err)
        res.status(400).send("internal server error.")
    }
})

router.get("/getMessage/:chatId",async(req,res)=>{
    const id=req.params.chatId;
    try{
        const data=await prisma.chat.findUnique({
            where:{
                id
            },
            select:{
                messages:{
                    include:{
                        sender:true
                    }
                }
            }
        });
        res.status(200).json({
            msg:"chats successfully fetched!",
            raw_data:data
        })

    }catch(err)
    {
        console.log(err);
        res.status(400).send(err);
    }
})
export default router;