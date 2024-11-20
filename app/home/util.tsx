
export async function leave_room(
    opts:{
    member_id: string,
    chat_id: string,
    conn_id: number
    }
    ){
    
    try{
        const resp=await fetch(`http://localhost:3001/chat/leaveChat`,{
                    method:'DELETE',
                    body:JSON.stringify({
                        memberId:opts.member_id,
                        chatId:opts.chat_id,
                        id:opts.conn_id
                    }),
                    headers:{
                        'Content-Type':"application/json"
                    },
                    credentials:"include"
                })
            return true;    
        }
        catch(err){
            console.log(err)
            alert("could not leave room!");
            return false;
        }
}