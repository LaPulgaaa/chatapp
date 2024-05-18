import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { worker_payload } from "../../packages/zod";
import type { WorkerPayload } from "../../packages/zod";


const client=createClient();
const prisma=new PrismaClient();

export async function start_worker(){
    console.log("start redis worker")
    try{
        await client.connect();

        try{
            while(true){
                const payload=await client.brPop("message",0);
                const message=worker_payload.parse(JSON.parse(payload?.element ?? ""));
                process_msg(message);
            }
        }catch(err){
            console.log(err);
        }
    }catch(err){
        console.log(err);
        console.log("could not connect redis client.")
    }
}

async function process_msg(message:WorkerPayload){
    try{
            await prisma.message.create({
            data:message
        })
    }catch(err){
        console.log(err);
    }
}

