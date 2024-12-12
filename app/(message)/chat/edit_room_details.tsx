'use client'
import {z} from "zod";
import assert from "minimalistic-assert";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { room_details_schema } from "@/packages/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRecoilStateLoadable } from "recoil";
import { subscribed_chats_state } from "@/lib/store/atom/subscribed_chats_state";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type FormValue = z.output<typeof room_details_schema>;

export default function EditRoomDetails({room_details,chat_id}:{room_details: FormValue,chat_id: string}){
    const [roomsStateData,setRoomsStateData] = useRecoilStateLoadable(subscribed_chats_state);
    const form_details = useForm<FormValue>({
        resolver: zodResolver(room_details_schema),
        defaultValues: {
            name: room_details?.name ?? "",
            discription: room_details?.discription ?? "",
        }
    })

    const {formState:{ isDirty,isLoading,isSubmitting }} = form_details;

    async function edit_chat_details(values: FormValue){
        try{
            const resp = await fetch(`/api/message/chat/${chat_id}`,{
                method: "PUT",
                credentials: "include",
                body: JSON.stringify({
                    ...values
                })
            });

            if(resp.status === 200){
                const all_rooms_data = roomsStateData.getValue();
                const narrowed_room = all_rooms_data.find((room) => room.id === chat_id);
                assert(narrowed_room !== undefined);
                const other_rooms = all_rooms_data.filter((room) => room.id !== narrowed_room.id);
                const updated_narrowed_room = {
                    ...narrowed_room,
                    name: values.name,
                    discription: values.discription,
                }
                setRoomsStateData([...other_rooms,updated_narrowed_room]);
            }
        }catch(err){
            console.log(err);
        }
    }

    return(
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Room Details</DialogTitle>
                <DialogDescription>Fill the details and click Save button</DialogDescription>
            </DialogHeader>
            <Form {...form_details}>
                <form onSubmit={form_details.handleSubmit(edit_chat_details)}>
                    <FormField
                        control={form_details.control}
                        name="name"
                        render={({field})=>(
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                            <Input placeholder='Name' {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                        )}

                    />
                    <FormField
                        control={form_details.control}
                        name="discription"
                        render={({field})=>(
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                            <Textarea placeholder='Description' {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                        )}

                    />
                    <DialogFooter>
                        <DialogClose className="w-full">
                            <Button 
                            className="w-full mt-4 mb-2"
                            disabled = { !isDirty || isLoading || isSubmitting}
                            type="submit"
                            >Save details</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </Form>
            </DialogContent>
    )
}