import { getServerSession } from "next-auth";
import { prisma } from "@/packages/prisma/prisma_client";
import { getToken } from "next-auth/jwt";

export async function GET(){
    const session = await getServerSession();

    if(session === null)
    return Response.json({message: "unauthorized"},{status: 401});

    try{
        //@ts-ignore
        const memberId = session.user.id;
        console.log(session)
        let joined_rooms=[];
        const message_subscribed_rooms=await prisma.message.findMany({
            where:{
                content:`chat_${memberId}`,
                deleted:true
            },
            select:{
                chat: true,
                id: true
            }
        })
        let raw_data = message_subscribed_rooms.map((room)=>{
            return {...room.chat,conn_id: room.id};
        });

        return Response.json({
            msg: "Success",
            raw_data,
        },{status: 200});
    }catch(err){
        return Response.json({
            msg: "Internal Server Error"
        },
        {
            status: 500
        }
    )
    }
}

export async function POST(req: Request){
    const session = await getServerSession();
    const {name,discription} = await req.json();
    if(session === null){
        return Response.json({
            msg: "Unauthorized"
        },{status: 401})
    }

    try{
        //@ts-ignore
        const memberId = session.user.id;
        console.log(session)
        const [new_room,chat_opcode]=await prisma.$transaction(async(tx)=>{
            const new_room=await tx.chat.create({
                data:{
                    name,
                    discription,
                }
            });
            await tx.directory.create({
                data:{
                    chat_id:new_room.id,
                    userId:memberId,
                    after:new_room.createdAt
                }
            })
            const chat_opcode=await tx.message.create({
                data:{
                    content:`chat_${memberId}`,
                    chatId:new_room.id,
                    memberId:memberId,
                    deleted: true
                }
            })
            return [new_room,chat_opcode];
        })
        return Response.json({
            msg:"Created Room Successfully",
            created_chat:new_room,
            created_opcode:chat_opcode
        },{status: 201})
    }catch(err){
        console.log(err);
        return Response.json({
            msg: "Internal Server Error"
        },{status: 500})
    }
}