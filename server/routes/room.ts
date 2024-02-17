import express from 'express';
import { PrismaClient } from '@prisma/client';


const router=express.Router();
const prisma=new PrismaClient();

type Chat={
    name:string,
    discription:string
}

router.post("/createChat",async(req,res)=>{
    const {name,discription}:Chat=req.body;

    try
    {
        const new_room=await prisma.chat.create({
        data:{
            name,
            discription
        }
        })
        res.status(201).json({
            msg:"created a new room",
            new_room
        })
    }catch(err)
    {
        res.status(400).send("internal server error.")
    }
})