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
    try{
        let joined_rooms=[];
        const message_subscribed_room=await prisma.message.findMany({
            where:{
                content:`chat_${memberId}`,
                deleted:false
            },
            include:{
                chat:true
            }
        })
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
        const [new_room,chat_opcode]=await prisma.$transaction(async(tx)=>{
            const new_room=await tx.chat.create({
                data:{
                    name,
                    discription,
                }
            });
            
            const chat_opcode=await tx.message.create({
                data:{
                    content:`chat_${memberId}`,
                    chatId:new_room.id,
                    memberId:memberId
                }
            })
            return [new_room,chat_opcode];
        })
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

router.post("/getMessage",async(req,res)=>{
    const creds:{chat_id:string,user_id:string}=req.body;
    try{
        const date=await prisma.directory.findFirst({
            where:{
                AND:[
                    {userId:creds.user_id},
                    {chat_id:creds.chat_id}
                ]
            },
            select:{
                after:true
            }
        })
        const data=await prisma.chat.findUnique({
            where:{
                id:creds.chat_id
            },
            select:{
                messages:{
                    where:{
                        createdAt:{
                            // new Date is to address backward compatability.
                            gt:date?.after ?? new Date('2002-01-28') 
                        }
                    },
                    include:{
                        sender:true
                    }
                }
            }
        });
        if(data!==null)
        {
            res.status(200).json({
            msg:"successfull",
            raw_data:data
            })
        }
        else
        {
            res.status(200).json({
                msg:"not_successfull"
            })
        }
    }catch(err)
    {
        console.log(err);
        res.status(400).send(err);
    }
})

router.post("/joinChat",async(req,res)=>{
    const {roomId,memberId}=req.body;
    try{
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
                }
            })
            res.status(201).json({
                msg:"Joined new room",
                raw_data:room,
                raw_opcode:room_opcode
            })
        }
        else{
            res.status(200).json({
                msg:"Room not found"
            })
        }
    }catch(err)
    {
        res.status(500).json({
            msg:err
        })
    }
})

router.delete("/leaveChat",async(req,res)=>{
    const {id}=req.body;
    try{
        const room=await prisma.message.update({
            where:{
                id
            },
            data:{
                deleted:true
            }
        })
        if(room){
            res.status(204).json({
                msg:'User left the room',
                raw_data:room
            })
        }
        else
        {
            res.status(200).json({
                msg:"could not delete room"
            })
        }
    }catch(err){
        res.status(500).json({
            msg:err
        })
    }
})

export default router;