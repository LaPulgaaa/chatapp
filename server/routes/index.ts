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
    console.log("get all users")
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

router.get("/findUser/:email",async(req,res)=>{
    const {email}=req.params;

    try{
        const user=await prisma.user.findFirst({
            where:{
                email
            }
        })
        if(user!==undefined)
        {
            res.status(200).json({
                msg:"found user!!",
                user
            });
        }
        else
        res.status(404).send("Not found!!");
    }catch(err)
    {
        res.status(400).send("server error!!")
    }
})
export default router;