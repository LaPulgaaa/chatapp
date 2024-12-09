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

export async function PUT(req: NextRequest,{params}:{ params: { chat_id: string }}){
    const { name, discription }:{ name: string, discription: string} = await req.json();
    const chat_id = params.chat_id;

    const token = getToken({ req });

    if(token === null)
        return Response.json({
            message: "Unauthorized"
    },{ status: 401 });

    try{
        //@ts-ignore
        const resp = await prisma.chat.update({
            where:{
                id: chat_id
            },
            data: {
                name,
                discription
            }
        })

        return Response.json({
            message: "Chat cleared successfully",
            data: resp
        },{ status: 200 });
    }catch(err){
        console.log(err);
        return Response.json({
            message: "Could not delete chat"
        },{ status:500})
    }
}