import { describe , it , vi , expect } from "vitest";
import  request  from "supertest";

import  {prisma}  from "../packages/prisma/__mocks__/prisma_client";

import { express_app as app } from "../bin";

vi.mock('../packages/prisma/prisma_client',async()=>{
    const actual=await vi.importActual<typeof import('../packages/prisma/__mocks__/prisma_client')>("../packages/prisma/__mocks__/prisma_client");

    return {
        ...actual
    };
});

vi.stubEnv('ACCESS_TOKEN_SECRET',"foo_jwt_bar");


describe("TEST_USER",()=>{
    it("should create a user",async()=>{

        prisma.member.create.mockResolvedValue({
            id:"foo",
            username:"varun",
            password:"supersecret",
            about:"student",
            deleted:false,
            favorite:["electrical"],
            avatarurl:"bar",
            status:"healthy"
        })

        const resp=await request(app).post("/user/signup").send({
            username: "varun",
            password: "supersecret"
        })

        console.log(resp.body.msg);
        expect(resp.statusCode).toBe(201);
        expect(resp.body.msg).toBe("created new user");
        expect(resp.body.member.status).toBe("healthy");

    })
})