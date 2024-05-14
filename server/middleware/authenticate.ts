import jwt from 'jsonwebtoken';
import { Request,Response,NextFunction } from 'express';


export default function authenticate(req:Request,res:Response,next:NextFunction){
    const token=req.cookies.token;
    if(token!==undefined && process.env.ACCESS_TOKEN_SECRET!==undefined)
        {
                jwt.verify(token,process.env.ACCESS_TOKEN_SECRET!,undefined,async(err,user)=>{
                if(err){
                    res.status(400).send(err)
                }
                else
                {
                    next();
                }
                
            })
        }
    else
    res.status(404).send("could not find token!!");
}