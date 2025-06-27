import { prisma } from "@/packages/prisma/prisma_client";

type Variant = "room" | "direct" | "avatar";

export async function verify_permission(username: string, variant: Variant, slug:string){
    switch(variant){
        case "direct": {
            const friendship = await prisma.friendShip.findFirst({
                where: {
                    connectionId: slug,
                    fromId: username
                }
            })

            if(friendship !== null) return true;

            return false;
        }
        case "room": {
            const room = await prisma.message.findFirst({
                where: {
                    content: `chat_${username}`,
                    chatId: slug
                }
            });

            if(room !== null) return true;

            return false;
        }
        default: return false;
    }
}