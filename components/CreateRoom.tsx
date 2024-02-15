'use client'
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle,DialogTrigger,} 
from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { RoomType, createRoomSchema } from "@/packages/zod";
import { Form,FormControl,FormDescription,FormField,FormLabel,FormItem,FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

export default function CreateRoom(){

    const form=useForm<RoomType>({
        resolver:zodResolver(createRoomSchema),
        defaultValues:{
            name:"",
            discription:""
        }
    })

    async function onSubmit(values:RoomType){
        console.log(values);
    }
    return(
        <Dialog>
            <DialogTrigger asChild>
                <Button >+ New</Button>
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
                                <Button type='submit' className="w-full">Create room</Button>
                                </DialogFooter>
                                    

                        </form>
                    </Form>
            </DialogContent>
        </Dialog>
    )
}