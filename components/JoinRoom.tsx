import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRecoilRefresher_UNSTABLE, useRecoilState } from "recoil";
import * as v from "valibot";

import { Button } from "./ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

import { Signal } from "@/app/home/signal";
import { UserStateChats } from "@/lib/store/atom/chats";
import { fetch_user_chats } from "@/lib/store/selector/fetch_chats";
import { user_chat_schema } from "@/packages/valibot";

export default function JoinRoomDialog() {
  const [roomid, setRoomId] = useState<string>("");
  const [rooms, setRooms] = useRecoilState(UserStateChats);
  const session = useSession();
  const router = useRouter();
  const [disable, setDisable] = useState(true);
  const refresh_chats = useRecoilRefresher_UNSTABLE(fetch_user_chats);

  useEffect(() => {
    if (roomid.trim() === "") setDisable(true);
    else setDisable(false);
  }, [roomid]);
  async function searchRoom() {
    if (session.status !== "authenticated") return;

    const room_already_joined = rooms.find((r) => r.id === roomid);
    if (room_already_joined !== undefined) {
      router.push(`/chat/${roomid}`);
      return;
    }

    try {
      const resp = await fetch(`/api/room/join/`, {
        method: "POST",
        body: JSON.stringify({
          roomId: roomid,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const raw_resp = await resp.json();

      if (resp.status === 200) {
        console.log("room found");
        const room_info = v.parse(user_chat_schema, raw_resp.raw_data);
        refresh_chats();
        setRooms([...rooms, room_info]);
        Signal.get_instance().ADD_ROOM(session.data.id, room_info.id);
      } else {
        alert("Room not found. Make sure the id is correct!!");
      }
    } catch (err) {
      console.log(err);
      alert(err);
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Join your friends !! Yayy</DialogTitle>
        <DialogDescription>
          Enter the room-id and press the button
        </DialogDescription>
      </DialogHeader>
      <div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="roomid">Room Id</Label>
          <Input
            type="text"
            placeholder="Enter a valid room id"
            value={roomid}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button disabled={disable} className={`w-full`} onClick={searchRoom}>
          Join Room
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
