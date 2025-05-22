import { prisma } from "../../packages/prisma/prisma_client";

export class IDGenSingleton {
  private static instance: IDGenSingleton;
  private last_chat_id: number;
  private last_dm_id: number;

  private constructor() {
    this.last_chat_id = 0;
    this.last_dm_id = 0;
  }

  public static get_instance() {
    if (IDGenSingleton.instance === undefined) {
      IDGenSingleton.instance = new IDGenSingleton();
    }

    return IDGenSingleton.instance;
  }

  public async init() {
    try {
      const resp = await prisma.message.findFirst({
        orderBy: {
          createdAt: "desc",
        },
      });
      this.last_chat_id = resp?.id ?? 0;
    } catch (err) {
      console.log(err);
      console.log("Could not set last chat id.");
    }
    try {
      const resp = await prisma.directMessage.findFirst({
        orderBy: {
          createdAt: "desc",
        },
      });
      this.last_dm_id = resp?.id ?? 0;
    } catch (err) {
      console.log(err);
      console.log("Could not set last dm id.");
    }
  }

  public gen_id(msg_type: "chat" | "dm") {
    if (msg_type === "chat") {
      return this.set_chat_id();
    }

    return this.set_dm_id();
  }

  private set_dm_id() {
    this.last_dm_id += 1;
    return this.last_dm_id;
  }

  private set_chat_id() {
    this.last_chat_id += 1;
    return this.last_chat_id;
  }
}
