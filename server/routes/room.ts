import express from 'express';
import { PrismaClient } from '@prisma/client';


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
    try{
        const message_subscribed_room=prisma.message.findMany({
            where:{
                content:`chat_${memberId}`
            },
            include:{
                chat:true
            }
        })
        res.status(200).json({
            msg:"subscribed room found",
            data:message_subscribed_room
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

export default router;