"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRecoilRefresher_UNSTABLE, useRecoilValueLoadable } from "recoil";
import * as v from "valibot";

import { update_avatar_url } from "./actions";
import { handle_file_upload } from "./util";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserDetails } from "@/lib/store/atom/userDetails";
import { user_details_edit_form_schema } from "@/packages/valibot";

type FormValue = v.InferOutput<typeof user_details_edit_form_schema>;

export default function Profile() {
  const { update, data, status } = useSession();
  const router = useRouter();
  const user_state = useRecoilValueLoadable(UserDetails);
  const refresh_state = useRecoilRefresher_UNSTABLE(UserDetails);
  const [fav, setFav] = useState<string>("");
  const [favsdirty, setFavsDirty] = useState<boolean>(false);
  const [favs, setFavs] = useState<string[]>([]);
  const user_details = user_state.getValue();
  const [avatar, setAvatar] = useState<string>("");

  const { toast } = useToast();

  const form_details = useForm<FormValue>({
    resolver: valibotResolver(v.required(user_details_edit_form_schema)),
    defaultValues: {
      username: "",
      name: "",
      avatarurl: "",
      status: "",
      about: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isDirty, isLoading, isSubmitting },
    setValue,
  } = form_details;

  useEffect(() => {
    if (user_state.state === "hasValue") {
      const loaded_state = user_state.contents;
      setValue("username", loaded_state?.username ?? "");
      setValue("name", loaded_state?.name ?? "");
      setValue("status", loaded_state?.status ?? "");
      setValue("about", loaded_state?.about ?? "");
      setFavs([...(loaded_state?.favorite ?? [])]);
      setAvatar(loaded_state?.avatarurl ?? "");
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_state.state, user_state.contents]);

  useEffect(() => {
    if (
      user_state.state === "hasValue" &&
      JSON.stringify(favs) === JSON.stringify(user_details?.favorite)
    ) {
      setFavsDirty(false);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favs, user_state.state]);

  async function onSubmit(form_data: FormValue) {
    try {
      const resp = await fetch("/api/member", {
        method: "PATCH",
        body: JSON.stringify({
          ...form_data,
          favorite: favs
        }),
        credentials: "include",
      });

      if (resp.status === 200) {
        toast({
          title: "Profile Update Successfully!",
          duration: 3000,
        });
        refresh_state();
        await update();
        return router.push("/home");
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function upload_avatar(e: React.ChangeEvent<HTMLInputElement>) {
    if (status !== "authenticated") return;

    const username = data.username;

    const uploaded_files = e.target.files;

    if (uploaded_files === null) return;

    const uploaded_avatar_file = uploaded_files[0];

    const resp = await handle_file_upload(uploaded_avatar_file,username,"avatar");

    if(!resp?.error){
      const has_updated = await update_avatar_url(username,resp.url);
      if(has_updated)
      setAvatar(resp.url)
      else
      toast({
        title: "Image upload failed",
        variant: "destructive"
      })
    }
    else{
      toast({
        title: "Image upload failed",
        description: resp.error,
        variant: "destructive"
      })
    }
  }

  if (user_state.state === "hasError") return router.push("/home");

  return (
    <div>
      {user_state.state === "hasValue" && (
        <div className="w-full flex flex-col p-4 border-2 rounded-md divide-y">
          <div className="p-2 m-2">
            <h3 className="scroll-m-20 md:text-2xl text-lg font-semibold tracking-tight">
              Profile
            </h3>
            <p className="text-sm md:text-md text-muted-foreground ">Manage your chat profile</p>
          </div>
          <div className="">
            <div className="flex sm:flex-row flex-col items-center gap-4 m-3">
              <Avatar className="mt-2 w-[74px] h-[74px]">
                <AvatarImage
                  className="contain"
                  src={user_details?.avatarurl ?? ""}
                />
                <AvatarFallback>
                  {user_details?.username?.substring(0, 2) ?? ""}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-2">
                <div className="flex flex-row gap-2">
                  {favs.map((fav, _index) => {
                    return (
                      <Badge key={_index} className="m-1">
                        {fav}
                      </Badge>
                    );
                  })}
                </div>
                <div className="flex lg:flex-row flex-col gap-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">Upload Avatar</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>Upload avatar</DialogTitle>
                      <div className="flex flex-col items-center space-y-8">
                        <Avatar className="w-[136px] h-[136px]">
                          <AvatarImage src={avatar} />
                        </Avatar>
                        <Input
                          type="file"
                          placeholder="Choose a file."
                          onChange={upload_avatar}
                        />
                        <DialogClose>
                          <div className="flex justify-end space-x-2">
                            <Button variant={"ghost"}>Cancel</Button>
                            <Button>Save</Button>
                          </div>
                        </DialogClose>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setAvatar("");
                    }}
                    variant={"secondary"}
                  >
                    Remove Avatar
                  </Button>
                </div>
              </div>
            </div>
            <Form {...form_details}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                <FormField
                  control={control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="flex border-[1.5px] rounded-md">
                          <p className="text-sm text-muted-foreground px-2 mt-3">
                            /user/
                          </p>
                          <Input disabled type="text" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" placeholder="Your name" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Share your status ..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="about"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Share something about yourself..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <Label>Favorite</Label>
                    <Input
                      onChange={(e) => {
                        setFav(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === " ") {
                          const add_fav = fav;
                          setFav("");
                          setFavs((favs) => [...favs, add_fav]);
                          setFavsDirty(true);
                        }
                      }}
                      type="text"
                      placeholder="Write your favorites and press space"
                    />

                </div>
                <div className="flex justify-end">
                  <Button
                    disabled={
                      (!isDirty || isLoading || isSubmitting) && !favsdirty
                    }
                    type="submit"
                    className=""
                  >
                    Save
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
