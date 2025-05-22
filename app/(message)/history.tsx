import MsgRender from "./dm_ui";

import type { RenderedMessage } from "@/packages/valibot";

export default function MessageHistory({
  msgs,
  username,
}: {
  msgs: RenderedMessage[];
  username: string;
}) {
  return (
    <div>
      {msgs.map((msg) => {
        return (
          <MsgRender id="history" key={msg.id} msg={msg} username={username} />
        );
      })}
    </div>
  );
}
