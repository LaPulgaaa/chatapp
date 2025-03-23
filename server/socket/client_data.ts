import * as v from "valibot";

export const typing_notification_payload = v.intersect([
  v.object({
    operation: v.union([v.literal("start"), v.literal("stop")]),
    user_id: v.string(),
  }),
  v.variant("type", [
    v.object({
      type: v.literal("CHAT"),
      room_id: v.string(),
    }),
    v.object({
      type: v.literal("DM"),
      conc_id: v.string(),
    }),
  ]),
]);
export const typing_notification_client_data = v.object({
  type: v.literal("TYPING"),
  payload: typing_notification_payload,
});
