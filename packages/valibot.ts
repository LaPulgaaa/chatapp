import * as v from "valibot";

export const user_signup_form_schema = v.object({
  username: v.pipe(
    v.string("Username must be string"),
    v.nonEmpty("Username is required"),
    v.minLength(8, "Username must have atleast 8 characters"),
    v.maxLength(20, "Username cannot be of more than 20 characters"),
  ),
  email: v.pipe(
    v.string("Email must be string"),
    v.trim(),
    v.email("Invalid email address"),
  ),
  password: v.pipe(
    v.string("Password must be string"),
    v.nonEmpty(),
    v.minLength(10, "Password must have atleast 10 characters"),
    v.maxLength(14, "Password cannot have more than 14 characters"),
  ),
});

export type Join = v.InferOutput<typeof user_signup_form_schema>;

export const message_schema = v.object({
  roomId: v.pipe(v.string(), v.nonEmpty("No room to chat with!")),
  username: v.pipe(v.string(), v.nonEmpty("Username not provided")),
  message: v.pipe(
    v.string(),
    v.nonEmpty(),
    v.maxLength(100, "Message can not be of more than 100 characters"),
  ),
});

export type Message = v.InferOutput<typeof message_schema>;

export const room_details_schema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Enter a valid name")),
  description: v.pipe(v.string(), v.maxLength(50)),
});

export type RoomType = v.InferOutput<typeof room_details_schema>;

export const user_chat_schema = v.object({
  createdAt: v.string(),
  lastmsgAt: v.string(),
  deleted: v.boolean(),
  description: v.string(),
  id: v.string(),
  name: v.string(),
  conn_id: v.number(),
  messages: v.array(
    v.object({
      id: v.number(),
      content: v.string(),
      sender: v.object({
        username: v.string(),
        name: v.nullish(v.string()),
      }),
      createdAt: v.string(),
    }),
  ),
  draft: v.optional(v.string()),
});

export type UserChat = v.InferOutput<typeof user_chat_schema>;

export const user_chats_response_schema = v.array(user_chat_schema);

export type ChatReponse = v.InferOutput<typeof user_chats_response_schema>;

export const unit_message_schema = v.object({
  content: v.string(),
  createdAt: v.string(),
  id: v.number(),
  sender: v.object({
    username: v.string(),
    name: v.nullish(v.string()),
  }),
});

export const chat_messages_schema = v.array(unit_message_schema);

export const chat_messages_response_schema = v.object({
  messages: chat_messages_schema,
});

export const room_details_response_schema = chat_messages_response_schema;
export type ChatMessageData = v.InferOutput<
  typeof chat_messages_response_schema
>;
export type UnitMessage = v.InferOutput<typeof unit_message_schema>;

export const member_profile_schema = v.object({
  username: v.string(),
  name: v.optional(v.string()),
  about: v.optional(v.string()),
  favorite: v.array(v.string()),
  status: v.string(),
  avatarurl: v.optional(v.string()),
});

export type MemberProfile = v.InferOutput<typeof member_profile_schema>;

export const worker_payload = v.variant("type", [
  v.object({
    type: v.literal("chat"),
    content: v.string(),
    chatId: v.string(),
    createdAt: v.string(),
    memberId: v.string(),
  }),
  v.object({
    type: v.literal("dm"),
    content: v.string(),
    concId: v.string(),
    createdAt: v.string(),
    friendshipId: v.string(),
    sender: v.string(),
    hash: v.string(),
  }),
]);

export type WorkerPayload = v.InferOutput<typeof worker_payload>;

export const room_header_details = v.object({
  name: v.string(),
  description: v.string(),
  createdAt: v.string(),
});

export type RoomHeaderDetails = v.InferOutput<typeof room_header_details>;

export const room_member_details_schema = v.array(
  v.object({
    username: v.string(),
    name: v.nullish(v.string()),
    active: v.boolean(),
    avatarurl: v.nullish(v.string()),
    status: v.nullish(v.string()),
  }),
);

export type RoomMemberDetails = v.InferOutput<
  typeof room_member_details_schema
>;

export const user_details_edit_form_schema = v.object({
  username: v.string(),
  name: v.optional(v.string()),
  avatarurl: v.optional(v.string()),
  about: v.optional(v.string()),
  status: v.optional(v.string()),
});

export const direct_msg_schema = v.object({
  id: v.number(),
  content: v.string(),
  createdAt: v.string(),
  sendBy: v.object({
    username: v.string(),
    name: v.nullish(v.string()),
  }),
  pinned: v.boolean(),
  starred: v.array(v.string()),
});

export const private_chat_schema = v.object({
  id: v.string(),
  blocked: v.boolean(),
  lastmsgAt: v.string(),
  to: v.object({
    username: v.string(),
    avatarurl: v.nullable(v.string()),
    about: v.nullable(v.string()),
    favorite: v.array(v.string()),
    name: v.nullable(v.string()),
    status: v.nullable(v.string()),
  }),
  messages: v.array(direct_msg_schema),
  connectionId: v.string(),
  draft: v.optional(v.string()),
});

export const private_chats_schema = v.array(private_chat_schema);

export type PrivateChat = v.InferOutput<typeof private_chat_schema>;

export type PrivateChats = PrivateChat[];

export type DirectMsg = {
  id: number;
  content: string;
  createdAt: Date;
  sendBy: {
    username: string;
  };
  pinned: boolean;
  starred: string[];
};

export const friend_search_result_schema = v.intersect([
  v.object({
    profile_info: v.object({
      status: v.nullable(v.string()),
      about: v.nullable(v.string()),
      favorite: v.array(v.string()),
      name: v.nullable(v.string()),
      avatarurl: v.nullable(v.string()),
    }),
  }),
  v.variant("is_friend", [
    v.object({
      is_friend: v.literal(false),
      friendship_data: v.undefined(),
    }),
    v.object({
      is_friend: v.literal(true),
      friendship_data: v.object({
        id: v.string(),
        connectionId: v.string(),
        messageFrom: v.optional(v.string()),
        blocked: v.boolean(),
        messages: v.array(direct_msg_schema),
        is_active: v.boolean(),
      }),
    }),
  ]),
]);
export type FriendSearchResult = v.InferOutput<
  typeof friend_search_result_schema
>;

export type DmProfileInfo = FriendSearchResult["profile_info"];

export type DirectMessage = v.InferOutput<typeof direct_msg_schema>;

export const message_delete_payload = v.object({
  hash: v.string(),
  conc_id: v.string(),
  type: v.literal("DM"),
  id: v.number(),
});

export type MessageDeletePayload = v.InferOutput<typeof message_delete_payload>;

export const message_pin_payload = v.object({
  type: v.union([v.literal("CHAT"), v.literal("DM")]),
  pinned: v.boolean(),
  hash: v.string(),
  id: v.number(),
  sender_id: v.string(),
  conc_id: v.string(),
});

export const message_star_payload = v.intersect([
  v.omit(message_pin_payload, ["pinned"]),
  v.object({ starred: v.array(v.string()) }),
]);

export type MessagePinPayload = v.InferOutput<typeof message_pin_payload>;
export type MessageStarPayload = v.InferOutput<typeof message_star_payload>;
