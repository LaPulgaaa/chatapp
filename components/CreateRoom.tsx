"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useRecoilStateLoadable } from "recoil";
import * as v from "valibot";

import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

import { Signal } from "@/app/home/signal";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { subscribed_chats_state } from "@/lib/store/atom/subscribed_chats_state";
import type { RoomType } from "@/packages/valibot";
import { create_room_api_resp_schema, room_details_schema } from "@/packages/valibot";

export default function CreateRoom() {
  const session = useSession();
  const [roomsStateData, setRoomsStateData] = useRecoilStateLoadable(
    subscribed_chats_state,
  );
  const form = useForm<RoomType>({
    resolver: valibotResolver(room_details_schema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const {
    formState: { isDirty, isSubmitting, isLoading },
  } = form;
  async function onSubmit(values: RoomType) {
    if (session.status === "authenticated") {
      try {
        const resp = await fetch("/api/room", {
          method: "POST",
          body: JSON.stringify({
            name: values.name,
            description: values.description,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        
        if (resp.status === 400) return alert("Error creating chat.");

        const raw_data = await resp.json();
        const data = v.parse(create_room_api_resp_schema,raw_data);

        Signal.get_instance().ADD_ROOM(session.data.username, data.chat.id);

        if(roomsStateData.state === "hasValue"){
          setRoomsStateData((rooms) => {
            return [{
              ...data.chat,
              messages: [],
              draft: undefined,
              unreads: undefined
            },...rooms]
          });
        }

      } catch (err) {
        console.log(err);
      }
    } else console.log("member_id is not defined");
  }
  return (
    <DialogContent className="sm:max-w-[425px] p-6">
      <DialogHeader>
        <DialogTitle>Create a room</DialogTitle>
        <DialogDescription>
          Fill in the details and click Create.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>description</FormLabel>
                <FormControl>
                  <Textarea placeholder="description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="mt-3">
            <DialogClose asChild>
              <Button
                disabled={!isDirty || isLoading || isSubmitting}
                type="submit"
                className="w-full"
              >
                Create room
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
