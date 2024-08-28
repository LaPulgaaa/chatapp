import {z} from 'zod';
import express from 'express';
import assert from 'minimalistic-assert';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { prisma } from '../../packages/prisma/prisma_client';

import authenticate from '../middleware/authenticate';
import { member_profile_schema } from '../../packages/zod';
import { Cache } from '../util/jwt';


const router=express.Router();

type UserInfo={
    username:string,
    password:string
}

router.get("/me",(req,res)=>{
    const token=req.cookies.token;
    if(token!==undefined){
        const creds=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
        res.json({
            msg:"user identified",
            data:creds
        })
    }
    else{
        res.status(200).json({
            msg:"token expired"
        })
    }
})

router.post("/signup",async(req,res)=>{
    const {username,password}:UserInfo=req.body;

    try{
        const new_created_user = await prisma.$transaction(async(tx)=>{
            const already_existing_user = await tx.member.findFirst({
                where:{
                    username,
                    password
                }
            });

            if(already_existing_user !== null){
                throw new Error("User with same password and username exists");
            }

            const new_created_user = await tx.member.create({
                data:{
                    username,
                    password
                }
            })

            return new_created_user;
        });

        const token=jwt.sign(new_created_user,process.env.ACCESS_TOKEN_SECRET!,{expiresIn:"3h"});

        Cache.get_instance().set_member_id(token);

        res.cookie("token",token,{
            sameSite:"lax",
            maxAge:60*60*24*1000,
            domain:"localhost",
            httpOnly:true
        })

        res.status(201).json({
            msg:"created new user",
            member:new_created_user,
        })

    }catch(err)
    {
        res.status(403).json({
            msg:err
        })
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
            Cache.get_instance().set_member_id(token);
            res.cookie("token",token,{
                sameSite:"lax",
                maxAge:60*60*3*1000,
                domain:"localhost",
                httpOnly:true
            })
            res.status(200).json({
                msg:"Logged in Successfully!!",
                member
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
        const token=req.cookies.token;
        Cache.get_instance().get_member_id(token);
        const creds=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
        if(token!==null || token!==undefined)
        {
            res.status(201).json({
            msg:"jwt token valid",
            creds
            })
        }
        else
        res.status(200).send("user not found");
    }catch(err){
        console.log("error in this creds route.")
        res.status(400).send("internal server error.");
    }
  
})

router.patch("/editProfile",authenticate,async(req,res)=>{

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
                name: profile_fields.name,
                about:profile_fields.about,
                status:profile_fields.status,
                favorite:profile_fields.favorite,
                avatarurl:profile_fields.avatarurl
            }
        });

        assert(process.env.ACCESS_TOKEN_SECRET !== undefined, "ACCESS_TOKEN_SECRET NOT DEFINED");

        const new_token = jwt.sign(updated_profile, process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: "3h"
        });

        Cache.get_instance().set_member_id(new_token);

        res.cookie("token",new_token,{
            sameSite: "lax",
            httpOnly: true,
            domain: "localhost",
            maxAge: 60*60*3*1000
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

router.patch("/deleteAccount/:memberId",authenticate,async(req,res)=>{
    const id:string=req.params.memberId;
    try{
        const resp=await prisma.member.update({
            where:{
                id
            },
            data:{
                deleted:true
            }
        })

        res.status(200).json({
            msg:"Account deleted. Thanks for using chat.com!",
            data:resp.deleted
        })
    }catch(err){
        console.log(err);
        res.status(500).json({
            msg:"could not delete account",
            data:err
        })
    }
})
export default router;