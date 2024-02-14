'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import { Button } from "@/components/ui/button";
import { Card,CardTitle,CardContent,CardHeader, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { joinSchema } from "@/packages/zod";
import { Join } from '@/packages/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { usePathname, useRouter } from 'next/navigation';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { userState } from '@/lib/store/atom/User';
import { wsState } from '@/lib/store/atom/Socket';
import { tokenState } from '@/lib/store/atom/Token';


export default function signup(){
    
    const wsConnection=useRecoilValue(wsState);
    const router=useRouter();

    const setToken=useSetRecoilState(tokenState);
    const token=useRecoilValue(tokenState);
    const pathname=usePathname();

    const form=useForm<Join>({
        resolver:zodResolver(joinSchema),
        defaultValues:{
        username:"",
        password:"",
        }
    });

    async function onSubmit(values:Join){
        try{
          const resp=await fetch("http://localhost:3000/user/signup",{
            method:"POST",
            body:JSON.stringify(values),
            headers:{
              'Content-Type':"application/json"
            }
          })
          // console.log(await resp.json());
          const {token}=await resp.json();
          if(token!==undefined)
          {
            setToken(token);
            alert("User created successfully")
          }
        }catch(err)
        {
          console.log(err);
        }
      }
    
    

    
    return <div className="flex justify-center p-12">
    {/* register form */}
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-12">
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
                  <Input placeholder='Password' {...field}/>
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}

            />
            </CardContent>
        <CardFooter>
          <Button type='submit' className="w-full">Join</Button>
        </CardFooter>
        </Card>
          </form>
      </Form>

  </div>
}