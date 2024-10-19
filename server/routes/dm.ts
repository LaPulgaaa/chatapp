import assert from "minimalistic-assert";

import express from "express";
import { prisma } from "../../packages/prisma/prisma_client";
import { getToken } from "next-auth/jwt";
import { RedisSubscriptionManager } from "../socket/redisClient";

const router = express.Router();

router.get("/search/:username",async(req,res)=>{
    const search_username = req.params.username;
    const token = await getToken({req});

    if(token === null)
    {
        return res.status(400).json({
            message: "UNAUTHORISED ACCESS"
        });
    }

    try{
        //@ts-ignore
        const username:string = token.username;
        const search_result = await prisma.member.findUnique({
            where: {
                username: search_username
            },
            select: {
                avatarurl: true,
                about: true,
                name: true,
                status: true,
                favorite: true,
            }
        });

        assert(search_result !== null);

        const friendship_status = await prisma.friendShip.findUnique({
            where: {
                fromId_toId: {
                    fromId: username,
                    toId: search_username,
                }
            },
            select: {
                connectionId: true,
                messageFrom: true,
                blocked: true,
                id: true,
            }

        });

        if(friendship_status === null){
            const data = {
                ...search_result,
                is_friend: false,
            }

            return res.status(200).json({
                message: 'SUCCESS',
                raw_data: data,
            });
        }

        const messages = await prisma.directMessage.findMany({
            where: {
                connectionId: friendship_status.connectionId,
            },
            select: {
                id: true,
                content: true,
                createdAt: true,
                sendBy: {
                    select: {
                        username: true,
                    }
                }
            }
        })
        let is_recipient_online = false; 
        const dm_participants = RedisSubscriptionManager.get_instance().getRoomMembers(friendship_status.connectionId);
        if(dm_participants !== undefined && dm_participants.has(search_username)){
            is_recipient_online = true;
        }

        const data = {
            ...search_result,
            is_friend: true,
            friendship_data: {...friendship_status, messages, is_active: is_recipient_online},
        };

        return res.status(200).json({
            message: "SUCCESS",
            raw_data: data,
        });

    }catch(err){
        console.log(err);
        return res.status(200).json({
            message: 'SERVER ERROR'
        });
    }
})

export default router;