import {z} from 'zod';
import express from 'express';

import {prisma} from '../../packages/prisma/prisma_client'
import authenticate from '../middleware/authenticate';

const router=express.Router();

type CreateRoomSchema={
    name:string,
    discription:string,
    memberId:string
}


router.get("/subscribedChats/:memberId",authenticate,async(req,res)=>{
    const {memberId}=req.params;
    try{
        let joined_rooms=[];
        const message_subscribed_room=await prisma.message.findMany({
            where:{
                content:`chat_${memberId}`,
                deleted:true
            },
            include:{
                chat:true
            }
        })
        for(let i=0;i<message_subscribed_room.length;i++){
            joined_rooms.push({...message_subscribed_room[i].chat, conn_id: message_subscribed_room[i].id})
        }
        res.status(200).json({
            msg:"subscribed room found",
            raw_data:joined_rooms
        })
    }catch(err)
    {
        console.log(err);
        res.status(200).json({
            msg:"could not found",
            raw_data:[]
        })
    }
    
})

router.post("/createChat",authenticate,async(req,res)=>{
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
            await tx.directory.create({
                data:{
                    chat_id:new_room.id,
                    userId:memberId,
                    after:new_room.createdAt
                }
            })
            const chat_opcode=await tx.message.create({
                data:{
                    content:`chat_${memberId}`,
                    chatId:new_room.id,
                    memberId:memberId,
                    deleted: true
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

router.post("/getMessage",authenticate,async(req,res)=>{
    const creds:{chat_id:string,user_id:string}=req.body;
    try{
        const directory=await prisma.directory.findFirst({
            where:{
                AND:[
                    {userId:creds.user_id},
                    {chat_id:creds.chat_id},
                ]
            },
            select:{
                after:true,
                id:true
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
                            gte:directory?.after
                        },
                        deleted: false
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
            raw_data:data,
            directory_id:directory?.id
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

router.post("/joinChat",authenticate,async(req,res)=>{
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

            res.status(201).json({
                msg:"Joined new room",
                raw_data:room,
                raw_opcode:room_opcode,
                directory_id:directory.id
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

router.delete("/leaveChat",authenticate,async(req,res)=>{
    const {id}=req.body;
    try{
        const room=await prisma.message.delete({
            where:{
                id
            }
        });
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

router.patch("/updateFrom",authenticate,async(req,res)=>{
    const {date,user_id,chat_id,did}:{date:Date,user_id:string,chat_id:string,did:number}=req.body;

    try{
        const updated_directory=await prisma.directory.update({
            where:{
                AND:[{userId:user_id},{chat_id:chat_id}],
                id:did
            },
            data:{
                after:date
            }
            
        })
        res.status(200).json({
            msg:"timeline updated successfully",
            data:updated_directory
        })
    }catch(err)
    {
        console.log(err);
        res.send("internal server error!")
    }
})
export default router;