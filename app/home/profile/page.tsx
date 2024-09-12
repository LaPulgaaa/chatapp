"use client"

import { useForm} from 'react-hook-form';
import { member_profile_schema,MemberProfile } from '@/packages/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserDetails } from '@/lib/store/atom/userDetails';
import { useRecoilValue } from 'recoil';
import { Avatar,AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Form,FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { KeyboardEvent, Suspense, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { z} from 'zod';

import { useRouter } from 'next/navigation';
import { ChevronLeftIcon } from 'lucide-react';
import { DarkLight } from '@/components/DarkLight';
import { useSession } from 'next-auth/react';
export default function Profile(){
    const router=useRouter();
    const session = useSession();
    //@ts-ignore
    const user_details = useRecoilValue(UserDetails({user_id: session.data?.user?.id}));
    const form=useForm<Omit<MemberProfile,"favorite"> & {favorite:string}>({
        resolver:zodResolver(z.intersection(member_profile_schema.omit({favorite:true}),z.object({
            favorite:z.string()
        }))),
        defaultValues:{
            //@ts-ignore
            username:session.data?.username ?? "",
            name: session.data?.user?.name ?? "",
            status:user_details?.status ?? "",
            about:user_details?.about ?? "",
            //@ts-ignore
            avatarurl: session.data?.user?.avatar_url,
            favorite:""
        }
    })
    const {formState:{isDirty,isSubmitting, isLoading}}=form;
    const [favorites,setFavorites]=useState([""]);
    const names=session.data?.user?.name?.split(" ");
    //@ts-ignore
    let initials = session.data?.user?.username?.substring(0,2);
    if(names){
        initials = names.map((name)=> name.charAt(0)).join("");
    }
    
    console.log(user_details);
    async function settings_change(values:Omit<MemberProfile,"favorite">&{favorite:string}){
        //@ts-ignore
        if(!session.data?.id)
            return;
        try{
            const resp=await fetch(`http://localhost:3001/user/editProfile`,{
                method:"PATCH",
                body:JSON.stringify({
                    //@ts-ignore
                    id:session.data.id,
                    name: values.name,
                    about:values.about,
                    favorite:favorites,
                    status:values.status,
                    avatarurl:values.avatarurl
                }),
                headers:{
                    'Content-Type':"application/json"
                },
                credentials:"include"
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
    async function delete_account(){
        //@ts-ignore
        if(!session.data?.id)
            return;
        try{
            //@ts-ignore
            const resp=await fetch(`http://localhost:3001/user/deleteAccount/${session.data.id}`,{
                method:'PATCH',
                headers:{
                    'Content-Type':"application/json"
                },
                credentials:"include"
            });
            if(resp.status==200){
                router.push("/");
                window.localStorage.clear();
            }
        }catch(err){
            console.log(err);
            alert("Could not delete account. Retry after some time.")
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
    function handleRemove(fav_text: string){
        let updated_favs = favorites.filter((fav)=> fav!==fav_text);
        setFavorites([...updated_favs]);
        form.setValue("favorite"," ",{shouldDirty: true});
    }

    const favs_comps=favorites.map((item)=>{
        return(
            <Badge onDoubleClick={()=>handleRemove(item)} key={item.substring(0,2)} className='mx-1'>{item}</Badge>
        )
    })
    const collection=<div className='flex mr-2'>{favs_comps}</div>;

    return (
        <Suspense>
            <div className="m-8  mx-24">
            <div className='flex justify-between'>
            <Button variant={'outline'} size={'icon'} 
            className=''
            onClick={()=>router.push("/home")}
            >
                <ChevronLeftIcon/>
            </Button>
            <DarkLight/>
            </div>
            <div className='p-4 border-2 rounded-sm sticky my-2'>
                <h3 className="text-2xl pb-2 font-semibold  scroll-m-20 tracking-tight first:mt-0">
                    Profile
                </h3>
                <h6 className="text-muted-foreground">Manage your settings for chat.city profile</h6>
            </div>
            <div className='border-2 p-4 rounded-sm sticky'>
                <div className='flex flex-left py-4'>
                   {session.status === "authenticated" && <Avatar className='w-[72px] h-[72px]'>
                        <AvatarImage src={session.data.user?.image!} alt="User Avatar"/>
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>}
                    <div className=' ml-4'>
                        <div className='flex mr-2 mb-4'>
                            {
                                (user_details?.favorite ?? ["user"]).map((item)=>{
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
                        name='name'
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                    type='text'
                                    placeholder={"Your full name"} {...field}
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
                                    <div {...field} className='border-2 flex p-1 rounded-md'>
                                    {collection}
                                        <Input
                                        {...field}
                                        className='border-none focus:outline-none focus:border-0'
                                        onKeyDown={handleAdd}
                                        placeholder='Your favorite food, place, person, pet etc.' 
                                        />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                        />
                        <div className='flex justify-end'>
                        <Button type='submit' disabled={
                            !isDirty ||
                            isLoading ||
                            isSubmitting
                        } >Update</Button>
                        </div>
                    </form>
                </Form>
            </div>
            <div className='p-4 rounded-sm border-2 my-2'>
                <div className='border-b mb-2'>
                    <h4 className='text-red-700 scroll-m-20 text-xl font-semibold tracking-tight first:mt-0'>
                        Cautious!
                    </h4>
                    <p className='leading-7 [&:not(:first-child)]:mt-6"'>
                        This action can not be undone.
                    </p>
                </div>
                {/* eventually add a dialog for warning before actually making request. */}
                <div className='flex justify-end '>
                    <Button
                    onClick={delete_account} 
                    className='hover:text-red-600 hover:bg-stone-300 ease-out duration-300 transition-all'>
                        Delete Account
                    </Button>
                </div>
                
            </div>

        </div>
        </Suspense>
    )
}