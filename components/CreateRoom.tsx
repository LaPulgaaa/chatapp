'use client'

import { useSession } from "next-auth/react";
import { useRecoilState } from "recoil";

import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} 
from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form,FormControl,FormField,FormLabel,FormItem,FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

import { UserStateChats } from "@/lib/store/atom/chats";
import { Signal } from "@/app/home/signal";
import { RoomType, create_room_schema } from "@/packages/zod";

export default function CreateRoom(){
    const session = useSession();
    const [rooms,setRooms]=useRecoilState(UserStateChats)
    const form=useForm<RoomType>({
        resolver:zodResolver(create_room_schema),
        defaultValues:{
            name:"",
            discription:""
        }
    });

    const {formState:{isDirty , isSubmitting, isLoading}} = form;
    async function onSubmit(values:RoomType){
        if(session.status === "authenticated")
        {
            try{
                const resp=await fetch("/api/room",{
                    method:"POST",
                    body:JSON.stringify({
                        name:values.name,
                        discription:values.discription
                    }),
                    headers:{
                        'Content-Type':"application/json"
                    },
                    credentials:"include"
                })
                if(resp.status===400)
                alert("Error creating chat.")
                else
                {
                    const {created_chat}=await resp.json();
                    //@ts-ignore
                    Signal.get_instance().ADD_ROOM(session.data.id!,created_chat.id);
                    setRooms([created_chat,...rooms]);
                }
            }catch(err)
            {
                
                console.log(err);
            }
        }
        else
        console.log("member_id is not defined");
    }
    return(
        <DialogContent className="sm:max-w-[425px] p-6">
                <DialogHeader>
                    <DialogTitle>
                        Create a room
                    </DialogTitle>
                    <DialogDescription>Fill in the details and click Create.</DialogDescription>
                </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>

                                <FormField
                                control={form.control}
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
                                control={form.control}
                                name="discription"
                                render={({field})=>(
                                <FormItem>
                                    <FormLabel>Discription</FormLabel>
                                    <FormControl>
                                    <Textarea placeholder='Discription' {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                                )}

                                />
                                <DialogFooter className="mt-3">
                                    <DialogClose asChild>
                                        <Button
                                        disabled = {
                                            !isDirty ||
                                            isLoading ||
                                            isSubmitting
                                        }
                                        type='submit' className="w-full">Create room</Button>
                                    </DialogClose>
                                </DialogFooter>
                        </form>
                    </Form>
            </DialogContent>
    )
}
