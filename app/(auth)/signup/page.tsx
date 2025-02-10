"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { create_user } from "./actions";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { user_signup_form_schema } from "@/packages/zod";






type FormValue = z.output<typeof user_signup_form_schema>;

export default function Signup() {
  const router = useRouter();
  const form = useForm<FormValue>({
    resolver: zodResolver(user_signup_form_schema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty, isLoading },
  } = form;

  async function onSubmit(values: FormValue) {
    try {
      const user = await create_user(values);

      if (user !== undefined) {
        const creds = {
          email: user.email,
          password: user.password,
        };
        const resp = await signIn<"credentials">("credentials", {
          ...creds,
          redirect: false,
        });

        if (resp?.ok) {
          router.push("/home");
          window.localStorage.setItem("token", "valid");
        } else {
          form.setError("root", { message: "Could not create user" });
        }
      } else {
        toast({
          title: "Could not create user",
          variant: "destructive",
          description: "Please try again!!",
        });
      }
    } catch (err) {
      console.log(err);
      alert("Signup Failed -- " + err);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center p-6 ">
        {/* register form */}
        <h2 className="scroll-m-20 border-b pb-2 m-6 text-3xl font-semibold tracking-tight first:mt-0 ">
          Welcome to chat.city !
        </h2>

        <Card className="px-6 divide-y divide-stone-800">
          <div className=" w-[500px] ">
            <CardHeader>
              <CardTitle>Sign Up to start chatting</CardTitle>
              <CardDescription>Your peers are waiting for you!</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-4">
                <CardContent>
                  <FormField
                    control={control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="flex border-[1.5px] rounded-md">
                            <p className="text-sm text-muted-foreground px-2 mt-3">
                              chat.city/
                            </p>
                            <Input
                              type="text"
                              placeholder="Username"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="">
                  <Button
                    disabled={!isDirty || isLoading || isSubmitting}
                    type="submit"
                    className="w-full mx-4"
                  >
                    Sign up
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </div>
          <div className="mx-10 mb-4">
            <Button
              onClick={async () => {
                await signIn("github", {
                  callbackUrl: "/home",
                });
              }}
              className="w-full mt-4"
            >
              <GitHubLogoIcon />
              <p className="ml-2">GitHub</p>
            </Button>
          </div>
        </Card>

        <Button variant={"link"} onClick={() => router.push("/login")}>
          Already have an account?
        </Button>
      </div>
    </div>
  );
}
