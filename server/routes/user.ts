import express from 'express';
import { PrismaClient} from '@prisma/client'

import jwt from 'jsonwebtoken'
const router=express.Router();
const prisma=new PrismaClient()

type UserInfo={
    username:string,
    password:string
}

router.post("/signup",async(req,res)=>{
    const {username,password}:UserInfo=req.body;
    console.log(username);
    try{
        const new_member=await prisma.member.create({
            data:{
                username,
                password
            }
        })
        const token=jwt.sign(new_member,process.env.ACCESS_TOKEN_SECRET!,{expiresIn:"3h"});
        res.status(201).json({
            msg:"created new user",
            member:new_member,
            token
        })
    }catch(err)
    {
        res.status(500).send(err)
    }

})


router.post("/login",async(req,res)=>{
    const {username,password}:UserInfo=req.body;
    console.log(username+""+password);
    try{
        const member=await prisma.member.findFirst({
            where:{
                username,
                password
            }
        })

        if(member!==null)
        {
            const token=jwt.sign(member,process.env.ACCESS_TOKEN_SECRET!,{expiresIn:"3h"});

            res.status(200).json({
                msg:"Logged in Successfully!!",
                member,
                token
            })
        }
        else
        res.status(404).send("User not found!!");
    }catch(err){
        res.status(404).send("Could not find user!!")
    }
})

router.delete("/eraseAll",async(req,res)=>{
    try{
        const status=await prisma.member.deleteMany({});
        if(status!==undefined)
        {
            res.status(200).json({
                msg:"all the member has been deleted successfully!",
                status
            })
        }
    }catch(err)
    {
        console.log(err)
        res.status(400).send("error deleting members!")
    }
})
export default router;