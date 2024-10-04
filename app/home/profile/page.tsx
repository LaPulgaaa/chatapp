'use client'

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { z } from "zod";

import { useForm } from "react-hook-form";

import { useSession } from "next-auth/react";
import { useRecoilRefresher_UNSTABLE, useRecoilValueLoadable } from "recoil";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import { UserDetails } from "@/lib/store/atom/userDetails";
import { zodResolver } from "@hookform/resolvers/zod";
import { user_details_edit_form_schema } from "@/packages/zod";

type FormValue = z.output<typeof user_details_edit_form_schema>;

export default function Profile(){
    const { update } = useSession();
    const router = useRouter();
    const user_state = useRecoilValueLoadable(UserDetails);
    const refresh_state = useRecoilRefresher_UNSTABLE(UserDetails);
    const [fav,setFav] = useState<string>("");
    const [favsdirty,setFavsDirty] = useState<boolean>(false);
    const [favs,setFavs] = useState<string[]>([]);
    const user_details = user_state.contents;

    const { toast } = useToast();

    const form_details = useForm<FormValue>({
        resolver: zodResolver(user_details_edit_form_schema.required()),
        defaultValues: {
            username: "",
            name: "",
            avatarurl: "",
            status: "",
            about: "",
        }
    });

    const { control, handleSubmit, formState:{isDirty, isLoading, isSubmitting}, setValue, getFieldState} = form_details;
    
    useEffect(()=>{
        if(user_state.state === "hasValue"){
            const loaded_state = user_state.contents;
            setValue("username",loaded_state?.username ?? "");
            setValue("name",loaded_state?.name ?? "");
            setValue("avatarurl",loaded_state?.avatarurl ?? "");
            setValue("status",loaded_state?.status ?? "");
            setValue("about",loaded_state?.about ?? "");
            setFavs([...loaded_state?.favorite ?? []])
        }

    },[user_state.state])

    useEffect(()=>{
        if(user_state.state === "hasValue" &&
            JSON.stringify(favs) === JSON.stringify(user_details.favorite)
        ){
            setFavsDirty(false);
        }
    },[favs]);

    async function onSubmit(form_data: FormValue){
        try{
            const resp = await fetch("/api/member",{
                method: 'PATCH',
                body: JSON.stringify({
                    ...form_data,
                    favorite: favs
                }),
                credentials: "include"
            });

            if(resp.status === 200){
                toast({
                    title: "Profile Update Successfully!",
                    duration: 3000
                });
                refresh_state();
                await update();
                return router.push("/home");
            }
        }catch(err){
            console.log(err);
        }
    }

    if(user_state.state === "hasError")
        return router.push('/home');

    return (
        <div>
            {
                user_state.state === "hasValue" && <div className="flex flex-col m-12 mx-24 p-4 border-2 rounded-md divide-y">
                <div className="p-2 m-2">
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        Profile
                    </h3>
                    <p className="text-muted-foreground">
                        Manage your chat.city profile
                    </p>
                </div>
                <div className="">
                    <div className="flex space-x-8 pt-4 m-4">
                        <Avatar className="mt-2 w-[74px] h-[74px]">
                            <AvatarImage height={"100px"} src={user_details?.avatarurl ?? ""}/>
                            <AvatarFallback>{user_details?.username?.substring(0,2) ?? ""}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-2">
                        <div>
                            {
                                favs.map((fav)=>{
                                    return(
                                        <Badge className="m-1">{fav}</Badge>
                                    )
                                })
                            }
                        </div>
                        <div className="flex space-x-2">
                            <Button disabled = {true}>Upload Avatar</Button>
                            <Button 
                            onClick={()=>{
                                setValue("avatarurl","");
                            }}
                            variant={"secondary"}>Remove Avatar</Button>
                        </div>
                        </div>
                    </div>
                    <Form {...form_details} >
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                            <FormField
                            control={control}
                            name="username"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                    <div className="flex border-[1.5px] rounded-md">
                                      <p className="text-sm text-muted-foreground px-2 mt-3">chat.city/</p>
                                      <Input type="text" {...field}/>
                                    </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={control}
                            name="name"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                        {...field}
                                        type="text" placeholder="Your name"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={control}
                            name="status"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <FormControl>
                                        <Input
                                        type="text" placeholder="Share your status ..."
                                        {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={control}
                            name="about"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel>About</FormLabel>
                                    <FormControl>
                                        <Input
                                        type="text" placeholder="Share something about yourself..."
                                        {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                            />
                            <div className="space-y-2">
                            <Label>Favorite</Label>
                            <div className="rounded-md border-2 flex">
                                <div className="flex space-x-1 mr-1">
                                    {
                                        favs.length >0 && favs.map((fav:string)=>{
                                            return(
                                                <Badge
                                                onDoubleClick={()=>{
                                                    let left_favs = favs.filter((f)=>f !== fav);
                                                    setFavs((f)=>[...left_favs]);
                                                }}
                                                className="m-1 p-2"
                                                key={fav}
                                                >{fav}</Badge>
                                            )
                                        })
                                    }
                                </div>
                                <Input
                                onChange={(e)=>{
                                    setFav(e.target.value);
                                }}
                                onKeyDown={(e)=>{
                                    if(e.key === " "){
                                        const add_fav = fav;
                                        setFav("");
                                        setFavs((favs)=>[...favs,add_fav]);
                                        setFavsDirty(true);
                                    }
                                }}
                                type="text" placeholder="Add your favs... anything you like .."
                                />
                            </div>
                            </div>
                            <div className="flex justify-end">
                            <Button
                            disabled = {
                                (!isDirty ||
                                isLoading ||
                                isSubmitting) && 
                                !favsdirty
                            }
                            type="submit"
                            className=""
                            >Save</Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
            }
        </div>
    )
}