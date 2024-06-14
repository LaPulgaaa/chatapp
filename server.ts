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

export let express_app: express.Express;

app.prepare().then(()=>{
    express_app=express();
    const server=http.createServer(express_app);
    const wss=new WebSocketServer({server});
   
    ws(wss);
    const corsOptions={
        origin:"http://localhost:3000",
        methods:'GET,PUT,POST,DELETE,PATCH',
        credentials:true,
    
    }
    express_app.use(cors(corsOptions));
    express_app.use(cookieParser());
    express_app.use(express.json());
    express_app.use("/user",userRouter);
    express_app.use('/chat',chatRouter);
    express_app.all("*",(req,res)=>{
        return handle(req,res);
    })
    server.listen(port,()=>{
        console.log("listening on port 3001, ws server connected!");
    })
    start_worker();
}).catch((err:Error)=>{
    console.log(err);
})