import express from 'express';
import next from 'next';
import http from 'http';
import cors from 'cors';
import userRouter from './server/routes/index'
import { WebSocketServer } from 'ws';
import {ws} from './server/socket/index'
const port=3000;
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
        origin:"http://localhost:3001",
        methods:'GET,PUT,POST,DELETE,PATCH',
        credentials:true,
    
    }
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use("/user",userRouter)
    app.all("*",(req,res)=>{
        return handle(req,res);
    })
    server.listen(port,()=>{
        console.log("listening on port 3000, ws server connected!");
    })
}).catch((err:Error)=>{
    console.log(err);
})