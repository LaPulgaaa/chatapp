"use client"

import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod'
import { Button } from "@/components/ui/button";
import { Card,CardTitle,CardContent,CardHeader, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { joinSchema } from "@/packages/zod";
import { Join } from '@/packages/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
export default function Home() {

  const router=useRouter();
  const form=useForm<Join>({
    resolver:zodResolver(joinSchema),
    defaultValues:{
      name:"",
      password:"",
      email:""
    }
  });

  async function onSubmit(values:Join){
    console.log(values);
    try{
      const resp=await fetch("http://localhost:3000/user/createUser",{
        method:"POST",
        body:JSON.stringify(values),
        headers:{
          'Content-Type':"application/json"
        }
      })
      console.log(await resp.json());
      if(resp.status==201)
      router.push('/chat');
    }catch(err)
    {
      console.log(err);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-12">
      <div>
        This is going to contain an intro
      </div>
      <div className="grid justify-items-center p-4">
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Chat with your friends and family!!</CardDescription>
          </CardHeader>
          <CardContent>
              <FormField
              control={form.control}
              name="name"
              render={({field})=>(
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='enter username' {...field} />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}

              />
              <FormField
              control={form.control}
              name="email"
              render={({field})=>(
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='enter your emails' {...field}/>
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
                    <Input placeholder='create a password' {...field}/>
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
    </div>
  );
}

// <div className="grid w-full items-center gap-4">
// <div className="flex flex-col space-y-1.5">
//   <Label htmlFor="name">Name</Label>
//   <Input id="name" placeholder="Your username" />
// </div>
// <div className="flex flex-col space-y-1.5">
//   <Label htmlFor="email">Email</Label>
//   <Input id="email" placeholder="Your email address" />
// </div>
// <div className="flex flex-col space-y-1.5">
//   <Label htmlFor="password">Password</Label>
//   <Input id="password" placeholder="Your password" />
// </div>
// </div>