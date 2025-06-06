import type { Session as AuthSession } from "next-auth";
import type { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends AuthSession {
    username: string;
    id: string;
    avatar_url: string | null;
    name: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    username: string;
    id: string;
  }
}
