"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import type * as v from "valibot";

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
import { user_signup_form_schema } from "@/packages/valibot";
import GoogleLogoIcon from "@/public/icons8-google-logo-48.png";

type FormValue = v.InferOutput<typeof user_signup_form_schema>;

export default function Signup() {
  const router = useRouter();
  const form = useForm<FormValue>({
    resolver: valibotResolver(user_signup_form_schema),
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

      if (user === undefined) {
        toast({
          title: "Could not create user",
          variant: "destructive",
          description: "Please try again!!",
        });

        return;
      }

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
    } catch (err) {
      console.log(err);
      toast({
        title: "Signin failed!!",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center ">
        <div className="flex flex-col">
          {/* register form */}
        <h2 className="flex justify-center">
          Welcome to chat.city !
        </h2>

        <Card className="sm:w-[500px] divide-y space-y-2">
            <CardHeader>
              <CardTitle className="truncate">Sign up to start chatting!</CardTitle>
              <CardDescription>Your peers are waiting for you!</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
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
                    className="w-full"
                  >
                    Sign up
                  </Button>
                </CardFooter>
              </form>
            </Form>
          <div className="mx-10 mb-2">
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
            <Button
              onClick={async () => {
                await signIn("google", {
                  callbackUrl: "/home",
                });
              }}
              className="w-full mt-4"
            >
              <Image
                height={24}
                width={24}
                src={GoogleLogoIcon}
                alt="google logo"
              />
              <p className="ml-2">Google</p>
            </Button>
          </div>
        </Card>

        <Button variant={"link"} onClick={() => router.push("/login")}>
          Already have an account?
        </Button>
        </div>
      </div>
    </div>
  );
}
