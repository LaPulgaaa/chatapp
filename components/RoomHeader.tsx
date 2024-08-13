

type Member = {
    name: string,
    active: boolean,
}

type RoomDetails = {
    name: string,
    desc: string,
    members: Member[],
    createdOn: string,
    createdBy: Member,
}

export default function RoomHeader(room_details: RoomDetails){
    return (
        <div>
            <div>
                
            </div>
        </div>
    )
}