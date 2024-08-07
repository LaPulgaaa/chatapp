'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import { Button } from "@/components/ui/button";
import { Card,CardTitle,CardContent,CardHeader, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { join_schema } from "@/packages/zod";
import { Join } from '@/packages/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { usePathname, useRouter } from 'next/navigation';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { wsState } from '@/lib/store/atom/Socket';
import Navbar from '@/components/Navbar';



export default function signup(){
    
    const wsConnection=useRecoilValue(wsState);
    const router=useRouter();
    const pathname=usePathname();

    const form=useForm<Join>({
        resolver:zodResolver(join_schema),
        defaultValues:{
        username:"",
        password:"",
        }
    });

    async function onSubmit(values:Join){
        try{
            const resp=await fetch("http://localhost:3001/user/signup",{
              method:"POST",
              body:JSON.stringify(values),
              headers:{
                'Content-Type':"application/json"
              },
              credentials:"include"
            })

            if(resp.status==201)
            {
              router.push("/home");
              window.localStorage.setItem("token","valid");
            }

            if(resp.status == 403)
            {
              alert("User with same username and password exists!");
            }

        }catch(err)
        {
          console.log(err);
          alert("Signup Failed -- "+err);
        }
      }
    
    

    
    return <div>
      <Navbar/>
      <div className="flex flex-col items-center p-6">
    {/* register form */}
    <h2 className='scroll-m-20 border-b pb-2 m-6 text-3xl font-semibold tracking-tight first:mt-0 '>
      Welcome to chat.city !
    </h2>
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6">
      <Card className="w-[500px] p-6">
        <CardHeader>
          <CardTitle>Sign Up to start chatting</CardTitle>
          <CardDescription>Your peers are waiting for you!</CardDescription>
        </CardHeader>
        <CardContent>
            <FormField
            control={form.control}
            name="username"
            render={({field})=>(
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder='Username' {...field} />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}

            />
            <FormField
            control={form.control}
            name="password"
            render={({field})=>(
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type='password' placeholder='Password' {...field}/>
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}

            />
            </CardContent>
        <CardFooter>
          <Button type='submit' className="w-full">Sign up</Button>
        </CardFooter>
        </Card>
          </form>
      </Form>
      <Button variant={"link"} onClick={()=>router.push("/login")}>
        Already have an account?
      </Button>
  </div>
    </div>
}