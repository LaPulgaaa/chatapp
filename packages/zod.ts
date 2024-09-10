import {z} from 'zod';

export const user_signup_form_schema = z.object({
    username: z.string({
        required_error: "Username is required"
    }).min(8,{message: "username must atleast be 8 characters"}).max(20),
    email: z.string().email({message: "Invalid email address"}),
    password: z.string({
        required_error: "Password is required"
    }).min(10,{message: "Password should atleast be 10 characters"}).max(14)
})


export const join_schema=z.object({
    username: z.string({
        required_error: "Username is required"
    }).min(8,{message: "username must atleast be 8 characters"}).max(20),
    password: z.string({
        required_error: "Password is required"
    }).min(10,{message: "Password should atleast be 10 characters"}).max(14)
})

export type Join=z.infer<typeof user_signup_form_schema>;


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
            lastmsgAt: z.string(),
            deleted:z.boolean(),
            discription:z.string(),
            id:z.string(),
            name:z.string(),
            conn_id: z.string(),
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
        username:z.string(),
        name: z.string().nullish(),
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
    name: z.string().optional(),
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

export const room_header_details = z.object({
    name: z.string(),
    discription: z.string(),
    createdAt: z.string()
});

export type RoomHeaderDetails = z.output<typeof room_header_details>;

export const room_member_details_schema = z.array(z.object({
    username: z.string(),
    name: z.string().nullish(),
    active: z.boolean(),
    avatarurl: z.string().nullish(),
    status: z.string().nullish(),
}))

export type RoomMemberDetails = z.output<typeof room_member_details_schema>;