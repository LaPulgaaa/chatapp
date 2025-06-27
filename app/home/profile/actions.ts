'use server'

import { prisma } from "@/packages/prisma/prisma_client";

export async function update_avatar_url(username: string, url: string){

    try{
        await prisma.member.update({
            where: {
                username
            },
            data: {
                avatarurl: url
            }
        });

        return true;
    }catch(err){
        console.log(err);
        return false;
    }
}