type MemberDetails = {
    name: string,
    active: boolean,
}

type RoomDetails = {
    name: string,
    discription: string,
    createdAt: string,
}

export default function RoomHeader({room_details}:{room_details: RoomDetails}){
    return (
        <div className="w-full mx-2">
            <div className="flex px-3 py-1 mx-2 border-[1.5px] border-slate-800 rounded ">
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mr-3">
                    {room_details.name}
                </h4>
                <h5 className="truncate border-l-2 pl-4 italic pt-[1px]">
                    {room_details.discription}
                </h5>
            </div>
        </div>
    )
}