import { PrismaClient } from "@prisma/client";
import { mockDeep , mockReset} from "vitest-mock-extended"
import { beforeEach } from "vitest";

beforeEach(()=>{
    mockReset(prisma);
})

const prisma = mockDeep<PrismaClient>();

export {prisma};