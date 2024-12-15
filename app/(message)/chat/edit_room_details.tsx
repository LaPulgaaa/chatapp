'use client'
import {z} from "zod";

import { 
    DialogClose,
    DialogContent,
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { room_details_schema } from "@/packages/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Signal } from "@/app/home/signal";

type FormValue = z.output<typeof room_details_schema>;

export default function EditRoomDetails({room_details,chat_id}:{room_details: FormValue,chat_id: string}){
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
            const message = {
                type: "update_details",
                payload: {
                    id: chat_id,
                    updated_details: {
                        ...values
                    }
                }
            }
            Signal.get_instance().SEND(JSON.stringify(message));
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