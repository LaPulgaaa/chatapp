import { NEXTAUTH_CONFIG } from "@/lib/auth";
import NextAuth from "next-auth";

const provider = NextAuth(NEXTAUTH_CONFIG);

export {provider as GET, provider as POST};
