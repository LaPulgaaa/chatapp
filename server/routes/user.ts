import {z} from 'zod';
import express from 'express';
import { PrismaClient} from '@prisma/client'
import jwt from 'jsonwebtoken'
import { createClient } from 'redis';

import authenticate from '../middleware/authenticate';
import { member_profile_schema } from '../../packages/zod';

const router=express.Router();
const prisma=new PrismaClient();
const redis=createClient();

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
                password,
                deleted:false
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

router.get("/getCreds",authenticate,async(req,res)=>{
    try{
        await redis.connect();
        const creds=await redis.get("user");
        redis.disconnect();
        if(creds!==null)
        {
            res.status(201).json({
            msg:"jwt token valid",
            data:JSON.parse(creds!)
            })
        }
        else
        res.status(200).send("user not found");
    }catch(err){
        res.status(400).send("internal server error.");
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

router.patch("/editProfile",async(req,res)=>{
    console.log("inside here!")
    const result=(z.intersection(
        z.object({
            id:z.string()
        }),
        member_profile_schema.omit({username:true,password:true})
    )).safeParse(req.body);
    
    if(!result.success){
        return res.status(400).json({
            msg:"could not update field",
            data:result.error
        })
    }

    try{
        const profile_fields=result.data;
        const updated_profile=await prisma.member.update({
            where:{
                id:profile_fields.id,
            },
            data:{
                about:profile_fields.about,
                status:profile_fields.status,
                favorite:profile_fields.favorite,
                avatarurl:profile_fields.avatarurl
            }
        })
        
        res.status(200).json({
            msg:"updated succesfully!",
            data:updated_profile
        })
    }catch(err){
        return res.status(500).json({
            msg:"unexpected server error",
            data:err
        })
    }

})
export default router;