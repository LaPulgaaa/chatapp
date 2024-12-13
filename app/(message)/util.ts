
export function get_new_local_id(last_msg_id: number, last_local_id?: number){
    let next_local_id = 1;
    if(last_local_id !== undefined)
        next_local_id += (last_local_id-Math.floor(last_local_id))*10;

    return (next_local_id/10)+last_msg_id;
}
