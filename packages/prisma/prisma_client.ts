import { PrismaClient } from "@prisma/client";

// this is named singleton because it ensures that PrismaClient
// has only instance globally. This function is single point of access
// to that object.
// https://chatgpt.com/c/d61d1539-fca3-4025-8129-7ea993a8565d
const prisma_client_singleton=()=>{
    return new PrismaClient();
}

type PrismaClientSingleton=ReturnType<typeof prisma_client_singleton>;

let globalPrisma=globalThis as unknown as {prisma: PrismaClientSingleton | undefined}; //this is the type dec.

export let prisma = globalPrisma.prisma ?? prisma_client_singleton(); // checking if client is cached.

if(process.env.NODE_ENV!=="production"){
    globalPrisma.prisma=prisma; //caching the client
}



