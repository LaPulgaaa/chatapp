"use client"

import { useForm} from 'react-hook-form';
import { member_profile_schema,MemberProfile } from '@/packages/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { userDetails } from '@/lib/store/atom/userDetails';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Avatar,AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Form,FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { KeyboardEvent, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { z} from 'zod';
export default function Profile(){
    const [user_details,setUser_details]=useRecoilState(userDetails);
    const form=useForm<Omit<MemberProfile,"favorite"> & {favorite:string}>({
        resolver:zodResolver(z.intersection(member_profile_schema.omit({favorite:true}),z.object({
            favorite:z.string()
        }))),
        defaultValues:{
            username:user_details.username ?? "",
            password:user_details.password ?? "",
            status:user_details.status ?? "",
            about:user_details.about ?? "",
            avatarurl:user_details.avatarurl ?? "",
            favorite:""
        }
    })
    const {formState:{isDirty,isSubmitting}}=form;
    const disable=isSubmitting || !isDirty;
    const [favorites,setFavorites]=useState(["user"]);
    
    console.log(user_details);
    async function settings_change(values:Omit<MemberProfile,"favorite">&{favorite:string}){
        // setUser_details({...values,favorite:favorites});

        try{
            const resp=await fetch(`http://localhost:3000/user/editProfile`,{
                method:"PATCH",
                body:JSON.stringify({
                    id:user_details.id,
                    about:values.about,
                    favorite:favorites,
                    status:values.status,
                    avatarurl:values.avatarurl
                }),
                headers:{
                    'Content-Type':"application/json"
                }
            })
            if(resp.status===200)
            {
                const data=await resp.json();
                console.log(data.data)
                alert("Profile Updated Successfully!");
            }
        }catch(err){
            console.log(err);
        }
    }

    function handleAdd(e:KeyboardEvent){
        if(e.key===" "){
            console.log("Added one more itemz");
            console.log(form.getValues("favorite"))
            setFavorites([...favorites,form.getValues("favorite")]);
            form.setValue("favorite","")
        }
    }

    const favs_comps=favorites.map((item)=>{
        return(
            <Badge key={item.substring(0,2)} className='mx-1'>{item}</Badge>
        )
    })
    const collection=<div className='flex mr-2'>{favs_comps}</div>;

    return (
        <div className="m-8  mx-24">
            <div className='p-4 border-2 rounded-sm sticky my-2'>
                <h3 className="text-2xl pb-2 font-semibold  scroll-m-20 tracking-tight first:mt-0">
                    Profile
                </h3>
                <h6 className="text-muted-foreground">Manage your settings for chat.city profile</h6>
            </div>
            <div className='border-2 p-4 rounded-sm sticky'>
                <div className='flex flex-left py-4'>
                    <Avatar className='w-[72px] h-[72px]'>
                        <AvatarImage src='' alt={`${user_details.username?.substring(2)}`}/>
                        <AvatarFallback>{user_details.username?.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div className=' ml-4'>
                        <div className='flex mr-2 mb-4'>
                            {
                                (user_details.favorite ?? ["user"]).map((item)=>{
                                    return(
                                        <Badge key={item.substring(0,2)} className='mx-1'>{item}</Badge>
                                    )
                                })
                            }
                        </div>
                        <Button disabled={true} className=''>Upload Avatar</Button>
                    </div>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(settings_change)} className='space-y-8 p-6'>
                        <FormField
                        control={form.control}
                        name='username'
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input disabled={true} type='text' placeholder='username' {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                            )}
                        />

                        <FormField
                        control={form.control}
                        name='password'
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                    type='password' placeholder='password' {...field}
                                    disabled={true}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name='status'
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <FormControl>
                                    <Textarea
                                    placeholder={"What's happening lately"} {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name='about'
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>About</FormLabel>
                                <FormControl>
                                    <Textarea
                                    placeholder={"Tell us about yourself"} {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name='favorite'
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Favorites</FormLabel>
                                
                                <FormControl>
                                    <div className='border-2 flex p-1 rounded-md'>
                                    {collection}
                                        <Input
                                        className='border-none focus:outline-none focus:border-0'
                                        {...field}
                                        onKeyDown={handleAdd}
                                        placeholder='Your favorite food, place, person, pet etc.' 
                                        />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                        />
                        <div className='flex justify-end'>
                        <Button type='submit' disabled={disable} >Update</Button>
                        </div>
                    </form>
                </Form>
            </div>

        </div>
    )
}