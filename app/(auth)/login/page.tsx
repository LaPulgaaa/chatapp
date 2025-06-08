"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useLayoutEffect} from "react";
import { useForm } from "react-hook-form";
import type * as v from "valibot";

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
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";
import { user_login_form_schema } from "@/packages/valibot";
import GoogleLogoIcon from "@/public/icons8-google-logo-48.png";


type FormValue = v.InferOutput<typeof user_login_form_schema>;

export default function Login() {
  const session = useSession();
  const router = useRouter();

  // a little shady
  useLayoutEffect(() => {
    if (session.status === "authenticated") router.push("/home");
  }, [router, session.status]);

  const form = useForm<FormValue>({
    resolver: valibotResolver(user_login_form_schema),
    defaultValues: {
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

      const credentials = {
        email: values.email,
        password: values.password,
      };

      const resp = await signIn<"credentials">("credentials", {
        ...credentials,
        redirect: false,
      });

      if (resp && resp.ok) {
        router.push("/home");
      } else {
        toast({
          variant: "destructive",
          title: "Sign in failed!!",
          description: "Please verify your creds",
          action: <ToastAction altText="Try Again!!">Try Again!!</ToastAction>,
        });
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Error while signing in user!",
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
          Welcome back!
        </h2>

        <Card className="sm:w-[500px] divide-y space-y-2">
            <CardHeader>
              <CardTitle className="truncate">SignIn and get back to chatting!</CardTitle>
              <CardDescription>Your peers are waiting for you!</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
                <CardContent>
                  <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="johndoe@example.com" {...field} />
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
                            placeholder="your super secret password"
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
                    Login
                  </Button>
                </CardFooter>
              </form>
            </Form>
          <div className="mx-10 mb-2 py-2">
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

        <Button variant={"link"} onClick={() => router.push("/signup")}>
          Don&apos;t have an account?
        </Button>
        </div>
      </div>
    </div>
  );
}
