import {z} from 'zod';

export const joinSchema=z.object({
    username:z.string({
        required_error:"Username is required",
        invalid_type_error:"name must be a string"
    }).min(2,{message:"username must be atleast 2 characters"}),
    password:z.string({
        required_error:"password is required"
    }).min(5,{message:"password should of min 5 digits"}),
})

export type Join=z.infer<typeof joinSchema>;


export const messageSchema=z.object({
    roomId:z.string({
        required_error:"no room to chat with!"
    }),
    username:z.string({
        required_error:"user unavailable"
    }),
    message:z.string().max(50,{message:"can not send message of length more than 50."})
})

export type Message=z.infer<typeof messageSchema>;

export const createRoomSchema=z.object({
    name:z.string({
        required_error:"enter a valid name"
    }).min(1),
    discription:z.string({
        required_error:"discription should be atleast 1 character."
    }).min(6).max(50)
})

export type RoomType=z.infer<typeof createRoomSchema>;

export const UserChatResponseSchema=z.array(
    z.object({
            createdAt:z.string(),
            deleted:z.boolean(),
            discription:z.string(),
            id:z.string(),
            name:z.string()
        }),
    
)

export const UnitMessageSchema= z.object({
    chatId:z.string(),
    content:z.string(),
    createdAt:z.string(),
    deleted:z.boolean(),
    id:z.string(),
    memberId:z.string(),
    sender:z.object({
        id:z.string(),
        password:z.string(),
        username:z.string()
    })
})

export const ChatMessagesResponseSchema=z.object({
    messages:z.array(UnitMessageSchema)
})
export type ChatMessageData=z.infer<typeof ChatMessagesResponseSchema>;
export type UnitMessage=z.infer<typeof UnitMessageSchema>;

export type ChatReponse=z.infer<typeof UserChatResponseSchema>;

export const member_profile_schema=z.object({
    username:z.string(),
    password:z.string(),
    about:z.string().optional(),
    favorite:z.array(z.string()),
    status:z.string(),
    avatarurl:z.string().optional(),
})

export type MemberProfile=z.infer<typeof member_profile_schema>;