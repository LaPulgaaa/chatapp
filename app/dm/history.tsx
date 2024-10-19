

import { DirectMessage } from "@/packages/zod";
import DmRender from "./dm_ui";

export default function DirectMessageHistory(
    {friend_avatar, dms, username }: {friend_avatar: string | null, dms: DirectMessage[], username: string}
){
    return(
        <div>
            {
                dms.map((dm)=>{
                    return(
                        <DmRender dm={dm} username={username} friend_avatar={friend_avatar}/>
                    )
                })
            }
        </div>
    )
}
