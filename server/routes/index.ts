import express from 'express';
import { PrismaClient} from '@prisma/client'
import { auth } from '@/auth';
import { NextApiRequest,NextApiResponse } from 'next';
import jwt from 'jsonwebtoken'
const router=express.Router();
const prisma=new PrismaClient()


router.post("/createUser",async (req,res)=>{
    const {name,email,password}=req.body;
    
    try{
        const user=await prisma.user.create({
            data:{
                name:name,
                email:email,
                password:password
            }
        })
        const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET!,{expiresIn:"1h"});
        console.log(token)
        res.status(201).json({
            message:"created new user",
            user,
            token
        })
    }catch(err)
    {
        res.status(400).send("internal server error.");
    }
})

router.get("/getUser",async(req,res)=>{
    
    try{
        const allUser=await prisma.user.findMany({});
        res.json({
            users:allUser
        })
    }catch(err)
    {
        res.status(404).send("could not find resource");
    }

})

export default router;