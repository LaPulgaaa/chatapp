import { Request,Response,NextFunction } from 'express';


export default async function authenticate(req:Request,res:Response,next:NextFunction){
    next();
}