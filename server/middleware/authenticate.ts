import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import { Request,Response,NextFunction } from 'express';

const redisClient=createClient();

export default function authenticate(req:Request,res:Response,next:NextFunction){
    const authheader=req.headers.authorization;
    
    if(authheader!==undefined){
        const token=authheader.split(" ")[1];

        if(token!==undefined && process.env.ACCESS_TOKEN_SECRET!==undefined)
        {
                jwt.verify(token,process.env.ACCESS_TOKEN_SECRET!,async(err,user)=>{
                if(err){
                    res.status(400).send("Invalid token")
                }
                else
                {
                    // const cachedData=await redisClient.get('user');
                    await redisClient.connect();
                    await redisClient.set('user',JSON.stringify(user));
                    await redisClient.disconnect();
                    next();
                }
                
            })
        }
        else
        res.status(404).send("could not find token!!");
    }
    else
    res.status(404).send("authheader does not have token");
}