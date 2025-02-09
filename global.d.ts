import { Session as AuthSession } from "next-auth";

declare global {
  interface Element {
    style: Record<string, string>;
  }
  interface Session extends AuthSession {
    username: string;
  }
}
