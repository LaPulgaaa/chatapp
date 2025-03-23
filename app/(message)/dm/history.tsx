import DmRender from "./dm_ui";

import type { DirectMessage } from "@/packages/valibot";

export default function DirectMessageHistory({
  dms,
  username,
}: {
  dms: DirectMessage[];
  username: string;
}) {
  return (
    <div>
      {dms.map((dm) => {
        return (
          <DmRender id="history" key={dm.id} dm={dm} username={username} />
        );
      })}
    </div>
  );
}
