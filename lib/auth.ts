import GithubProvider from "next-auth/providers/github";
import CredentialProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, SessionStrategy } from "next-auth";
import { prisma } from "@/packages/prisma/prisma_client";

export const NEXTAUTH_CONFIG: NextAuthOptions = {
  providers: [
    CredentialProvider({
      id: "credentials",
      name: "chat",
      type: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "johndoe123@gmail",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "your super secret password",
        },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Credentials not available");
        }

        const existing_user = await prisma.member.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            username: true,
            avatarurl: true,
            name: true,
            email: true,
            password: true,
          },
        });

        if (existing_user === null) {
          throw new Error("User not found");
        }

        if (existing_user.password !== credentials.password) {
          throw new Error("Incorrect passwords");
        }

        return {
          ...existing_user,
        };
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" as SessionStrategy },
  callbacks: {
    async jwt(params) {
      if (!params.token.email) {
        throw new Error("Credentials not present!");
      }
      if (params.token.sub) {
        if (params.trigger === "signIn" || params.trigger === "update") {
          const user = await prisma.member.findUnique({
            where: {
              email: params.token.email,
            },
            select: {
              id: true,
              username: true,
              avatarurl: true,
              name: true,
              email: true,
            },
          });

          if (user) {
            return {
              ...params.token,
              id: user.id,
              username: user.username,
              email: user.email,
              name: user.name,
              avatar_url: user.avatarurl,
            };
          }

          const new_user = await prisma.member.create({
            data: {
              email: params.token.email,
              //@ts-expect-error to be removed soon
              username: params.profile?.login ?? "",
              avatarurl: params.token.picture,
              name: params.token.name,
            },
            select: {
              id: true,
              username: true,
              avatarurl: true,
              name: true,
              email: true,
            },
          });

          return {
            ...params.token,
            id: new_user.id,
            username: new_user.username,
            email: new_user.email,
            name: new_user.name,
            avatar_url: new_user.avatarurl,
          };
        }

        return {
          ...params.token,
        };
      }

      return { ...params.token };
    },
    async session(params) {
      return {
        ...params.session,
        ...params.token,
      };
    },
  },
  pages: {
    signIn: "/signup",
  },
};
