

import { DirectMessage } from "@/packages/zod";
import DmRender from "./dm_ui";

export default function DirectMessageHistory(
    { dms, username }: { dms: DirectMessage[], username: string}
){
    return(
        <div>
            {
                dms.map((dm)=>{
                    return(
                        <DmRender dm={dm} username={username}/>
                    )
                })
            }
        </div>
    )
}
