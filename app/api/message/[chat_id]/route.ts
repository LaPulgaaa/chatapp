import { prisma } from "@/packages/prisma/prisma_client";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function GET(req:NextRequest,
    { params }:{ params: { chat_id: string }}
){
    const chat_id = params.chat_id;
    const token = await getToken({req});

    if(token === null)
    return Response.json({
        msg: "Unauthorized",
    },{status: 401});

    

    try{
        //@ts-ignore
        const userId: string = token.id;
        const directory=await prisma.directory.findFirst({
            where:{
                AND:[
                    {userId},
                    {chat_id},
                ]
            },
            select:{
                after:true,
                id:true
            }
        })
        const data=await prisma.chat.findUnique({
            where:{
                id:chat_id
            },
            select:{
                messages:{
                    where:{
                        createdAt:{
                            gte:directory?.after
                        },
                        deleted: false
                    },
                    include:{
                        sender:{
                            select:{
                                username: true,
                                name: true,
                            }
                        }
                    }
                },
                name: true,
                discription: true,
                createdAt: true,
            }
        });
        if(data!==null)
        {
            return Response.json({
            msg:"Request success",
            raw_data:data,
            directory_id:directory?.id
            },{status: 200})
        }

        
        return Response.json({
            msg: "Failed",
        })
    }catch(err)
    {
        console.log(err);
        return Response.json({
            msg: "Server Error",
        },{status: 400})
    }
}