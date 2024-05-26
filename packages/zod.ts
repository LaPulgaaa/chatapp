import {z} from 'zod';

export const join_schema=z.object({
    username:z.string({
        required_error:"Username is required",
        invalid_type_error:"name must be a string"
    }).min(2,{message:"username must be atleast 2 characters"}),
    password:z.string({
        required_error:"password is required"
    }).min(5,{message:"password should of min 5 digits"}),
})

export type Join=z.infer<typeof join_schema>;


export const message_schema=z.object({
    roomId:z.string({
        required_error:"no room to chat with!"
    }),
    username:z.string({
        required_error:"user unavailable"
    }),
    message:z.string().max(50,{message:"can not send message of length more than 50."})
})

export type Message=z.infer<typeof message_schema>;

export const create_room_schema=z.object({
    name:z.string({
        required_error:"enter a valid name"
    }).min(1),
    discription:z.string({
        required_error:"discription should be atleast 1 character."
    }).min(6).max(50)
})

export type RoomType=z.infer<typeof create_room_schema>;

export const user_chat_response_schema=z.array(
    z.object({
            createdAt:z.string(),
            deleted:z.boolean(),
            discription:z.string(),
            id:z.string(),
            name:z.string()
        }),
    
)

export const unit_message_schema= z.object({
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

export const chat_messages_response_schema=z.object({
    messages:z.array(unit_message_schema)
})
export type ChatMessageData=z.infer<typeof chat_messages_response_schema>;
export type UnitMessage=z.infer<typeof unit_message_schema>;

export type ChatReponse=z.infer<typeof user_chat_response_schema>;

export const member_profile_schema=z.object({
    username:z.string(),
    password:z.string(),
    about:z.string().optional(),
    favorite:z.array(z.string()),
    status:z.string(),
    avatarurl:z.string().optional(),
})

export type MemberProfile=z.infer<typeof member_profile_schema>;

export const worker_payload=z.object({
    content:z.string(),
    chatId:z.string(),
    memberId:z.string()
})

//z.output is an alias for z.infer
export type WorkerPayload=z.output<typeof worker_payload>;