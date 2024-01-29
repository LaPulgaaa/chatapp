import {z} from 'zod';

export const joinSchema=z.object({
    name:z.string({
        required_error:"Username is required",
        invalid_type_error:"name must be a string"
    }).min(2,{message:"username must be atleast 2 characters"}),
    password:z.string({
        required_error:"password is required"
    }).min(5,{message:"password should of min 5 digits"}),
    email:z.string().email({message:"not a valid email address"})
})

export type Join=z.infer<typeof joinSchema>;


export const messageSchema=z.object({
    roomId:z.string({
        required_error:"no room to chat with!"
    }),
    username:z.string({
        required_error:"user unavailable"
    }),
    message:z.string().max(50,{message:"can not send message of length more than 50."})
})

export type Message=z.infer<typeof messageSchema>;