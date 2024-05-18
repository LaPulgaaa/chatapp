import express from 'express';
import next from 'next';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './server/routes/user';
import chatRouter from './server/routes/room';
import { start_worker } from './server/workers';
import { WebSocketServer } from 'ws';
import {ws} from './server/socket/index'
const port=3001;
const hostname='localhost';
const dev=process.env.NODE_ENV !== 'production';
const app=next({dev,hostname,port});

const handle=app.getRequestHandler();

app.prepare().then(()=>{
    const app=express();
    const server=http.createServer(app);
    const wss=new WebSocketServer({server});
   
    ws(wss);
    const corsOptions={
        origin:"http://localhost:3000",
        methods:'GET,PUT,POST,DELETE,PATCH',
        credentials:true,
    
    }
    app.use(cors(corsOptions));
    app.use(cookieParser());
    app.use(express.json());
    app.use("/user",userRouter);
    app.use('/chat',chatRouter);
    app.all("*",(req,res)=>{
        return handle(req,res);
    })
    server.listen(port,()=>{
        console.log("listening on port 3001, ws server connected!");
    })
    start_worker();
}).catch((err:Error)=>{
    console.log(err);
})