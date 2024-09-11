import { Request,Response,NextFunction } from 'express';


export default async function authenticate(req:Request,res:Response,next:NextFunction){
    const token=req.cookies["next-auth.session-token"];
    if(!token){
        res.status(401).json({
            message: "unauthorized access. token not present"
        })
    };
    next();
}