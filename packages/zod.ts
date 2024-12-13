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

export const room_details_schema=z.object({
    name:z.string({
        required_error:"enter a valid name"
    }).min(1),
    discription:z.string({
        required_error:"discription should be atleast 1 character."
    }).min(6).max(50)
})

export type RoomType=z.infer<typeof room_details_schema>;

export const user_chat_schema = z.object({
    createdAt:z.string(),
    lastmsgAt: z.string(),
    deleted:z.boolean(),
    discription:z.string(),
    id:z.string(),
    name:z.string(),
    conn_id: z.number(),
    messages: z.array(z.object({
        id: z.number(),
        content: z.string(),
        sender: z.object({
            username: z.string(),
            name: z.string().nullish(),
        }),
        createdAt: z.string(),
    })),
})

export const user_chats_response_schema=z.array(
    user_chat_schema, 
)

export const unit_message_schema= z.object({
    content:z.string(),
    createdAt:z.string(),
    id:z.number(),
    sender:z.object({
        username:z.string(),
        name: z.string().nullish(),
    })
})

export const chat_messages_schema = z.array(unit_message_schema);

export const chat_messages_response_schema=z.object({
    messages: chat_messages_schema,
});

export const room_details_response_schema = chat_messages_response_schema;
export type ChatMessageData=z.infer<typeof chat_messages_response_schema>;
export type UnitMessage=z.infer<typeof unit_message_schema>;

export type ChatReponse=z.infer<typeof user_chats_response_schema>;

export const member_profile_schema=z.object({
    username:z.string(),
    name: z.string().optional(),
    about:z.string().optional(),
    favorite:z.array(z.string()),
    status:z.string(),
    avatarurl:z.string().optional(),
})

export type MemberProfile=z.infer<typeof member_profile_schema>;

export const worker_payload = z.discriminatedUnion("type",[
    z.object({
        type: z.literal("chat"),
        content: z.string(),
        chatId: z.string(),
        createdAt: z.string(),
        memberId: z.string(),
    }),
    z.object({
        type: z.literal("dm"),
        content: z.string(),
        concId: z.string(),
        createdAt: z.string(),
        friendshipId: z.string(),
        sender: z.string(),
        hash: z.string(),
    })
])

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

export const user_details_edit_form_schema = z.object({
    username: z.string(),
    name: z.string().nullish(),
    avatarurl: z.string().optional(),
    about: z.string().optional(),
    status: z.string().optional(),
})

export const private_chat_schema = z.object({
    id: z.string(),
    blocked: z.boolean(),
    lastmsgAt: z.string(),
    to: z.object({
        username: z.string(),
        avatarurl: z.string().nullable(),
        about: z.string().nullable(),
        favorite: z.array(z.string()),
        name: z.string().nullish(),
        status: z.string().nullable(),
    }),
    messages: z.array(z.object({
        content: z.string(),
        sendBy: z.object({
            username: z.string(),
            name: z.string().nullish(),
        }),
        createdAt: z.string(),
        id: z.number(),
    })),
    connectionId: z.string(),
});

export const private_chats_schema = z.array(private_chat_schema);

export type PrivateChat = z.output<typeof private_chat_schema>;

export type PrivateChats = PrivateChat[];

export const direct_msg_schema = z.object({
    id: z.number(),
    content: z.string(),
    createdAt: z.string(),
    sendBy: z.object({
        username: z.string(),
        name: z.string().nullish(),
    })
});

export type DirectMsg = {
    id: number,
    content: string,
    createdAt: Date,
    sendBy: {
        username: string,
    }
}

export const friend_search_result_schema = z.discriminatedUnion("is_friend", [
    z.object({
        is_friend: z.literal(false),
        friendship_data: z.undefined(),
    }),
    z.object({
        is_friend: z.literal(true),
        friendship_data: z.object({
            id: z.string(),
            connectionId: z.string(),
            messageFrom: z.string().optional(),
            blocked: z.boolean(),
            messages: z.array(direct_msg_schema),
            is_active: z.boolean(),
        })
    })
]).and(
    z.object({
            profile_info: z.object({
                status: z.string().nullable(),
                about: z.string().nullable(),
                favorite: z.array(z.string()),
                name: z.string().nullish(),
                avatarurl: z.string().nullable(),
            })
    })
);

export type FriendSearchResult = z.output<typeof friend_search_result_schema>;

export type DmProfileInfo = FriendSearchResult["profile_info"];

export type DirectMessage = z.output<typeof direct_msg_schema>;

export const message_delete_payload = z.object({
    hash: z.string(),
    conc_id: z.string(),
    type: z.literal("DM"),
    id: z.number(),
})

export type MessageDeletePayload = z.output<typeof message_delete_payload>;