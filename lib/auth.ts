import GithubProvider from "next-auth/providers/github";
import type { NextAuthOptions, SessionStrategy  } from "next-auth";
import { prisma } from "@/packages/prisma/prisma_client";

export const NEXTAUTH_CONFIG:NextAuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
            allowDangerousEmailAccountLinking: true,
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {strategy: "jwt" as SessionStrategy},
    callbacks: {
        async jwt(params){
            if(!params.token.email){
                throw new Error("Credentials not present!");
            }
            if(params.token.sub){
                console.log(params.trigger + "trigger hai");

                if(params.trigger === "signIn")
                {
                        const user = await prisma.member.findUnique({
                            where:{
                                email: params.token.email
                            },
                            select:{
                                id: true,
                                username: true,
                                avatarurl: true,
                                name: true,
                                email: true
                            }
                        });
    
                        if(user){
                            return {
                                id:user.id,
                                username: user.username,
                                email: user.email,
                                avatar_url: user.avatarurl,
                                name: user.name,
                                ...params.token
                            }
                        };

                        const new_user = await prisma.member.create({
                            data:{
                                email: params.token.email,
                                //@ts-ignore
                                username: params.profile?.login ?? "",
                                avatarurl: params.token.picture,
                                name: params.token.name,
                            },
                            select:{
                                id: true,
                                username: true,
                                avatarurl: true,
                                name: true,
                                email: true,
                            }
                        });
    
                        return {
                            id:new_user.id,
                            username: new_user.username,
                            email: new_user.email,
                            avatar_url: new_user.avatarurl,
                            name: new_user.name,
                            ...params.token
                        }
                }
                
                return {
                    ...params.token
                }

            }

            return {...params.token}
        },
        async session(params){
            return {
                ...params.session,
                ...params.token
            }
        }
    },
    pages: {
        signIn: "/signup"
    }
}