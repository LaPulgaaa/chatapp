'use client'
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import {Dialog,DialogClose,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle,DialogTrigger,} 
from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { RoomType, create_room_schema } from "@/packages/zod";
import { Form,FormControl,FormDescription,FormField,FormLabel,FormItem,FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { userDetails } from "@/lib/store/atom/userDetails";
import { UserStateChats } from "@/lib/store/atom/chats";


export default function CreateRoom(){
    const member_data=useRecoilValue(userDetails);
    const [rooms,setRooms]=useRecoilState(UserStateChats)
    const form=useForm<RoomType>({
        resolver:zodResolver(create_room_schema),
        defaultValues:{
            name:"",
            discription:""
        }
    })
    async function onSubmit(values:RoomType){
        if(member_data.id)
        {
            try{
                const resp=await fetch("http://localhost:3001/chat/createChat",{
                    method:"POST",
                    body:JSON.stringify({
                        name:values.name,
                        discription:values.discription,
                        memberId:member_data.id!
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
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-[150px]">+ New</Button>
            </DialogTrigger>
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
                                        <Button type='submit' className="w-full">Create room</Button>
                                    </DialogClose>
                                </DialogFooter>
                                    

                        </form>
                    </Form>
            </DialogContent>
        </Dialog>
    )
}