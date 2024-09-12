import express from 'express';

import {prisma} from '../../packages/prisma/prisma_client'
import authenticate from '../middleware/authenticate';
import { RedisSubscriptionManager } from '../socket/redisClient';

const router=express.Router();

type CreateRoomSchema={
    name:string,
    discription:string,
    memberId:string
}

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
                        sender:{
                            select:{
                                username: true,
                                name: true,
                            }
                        }
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

router.get("/getDetails/:room_id",authenticate,async(req,res)=>{
    const room_id = req.params.room_id;
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
            return res.status(404).json({
                msg: "Room details not found"
            })
        }

        res.status(200).json({
            msg: "success",
            raw_data: resp,
        })
    }catch(err){
        res.status(500).json({
            msg: "Could not fetch details",
            err: err
        })
    }
})
router.get("/getMembers/:room_id",authenticate,async(req,res)=>{
    const room_id = req.params.room_id;
    try{
        const resp = await prisma.directory.findMany({
            where:{
                chat_id: room_id
            },
            select:{
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        status: true,
                        avatarurl: true
                    }
                }
            }
        });
        const activeMemberIds = RedisSubscriptionManager.get_instance().getRoomMembers(room_id);
        const member_info = resp.map(({user})=>{
            const {id, ...details} = user;
            const maybe_active = activeMemberIds?.has(id);
            if(maybe_active !== undefined && maybe_active === true){
                return {
                    ...details,
                    active: true
                }
            }
            return {
                ...details,
                active: false
            }
        });

        return res.status(200).json({
            msg: "successfull",
            raw_data: member_info
        })
    }catch(err){
        res.status(500).json({
            msg: "Could not fetch members",
            err
        })
    }
})
export default router;