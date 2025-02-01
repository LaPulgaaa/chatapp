import { z } from "zod";

export const typing_notification_payload = z.object({
    operation: z.enum(["start","stop"]),
    user_id: z.string(),
}).and(
    z.discriminatedUnion("type",[
        z.object({
            type: z.literal("CHAT"),
            room_id: z.string(),
        }),
        z.object({
            type: z.literal("DM"),
            conc_id: z.string(),
        })
    ])
)
export const typing_notification_client_data = z.object({
    type: z.literal("TYPING"),
    payload: typing_notification_payload
})