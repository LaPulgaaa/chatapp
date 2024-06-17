import next from 'next';
import http from 'http';
import { WebSocketServer } from 'ws';

import { start_worker } from './server/workers';
import { express_app } from './bin';
import {ws} from './server/socket/index'

const port=3001;
const hostname='localhost';
const dev=process.env.NODE_ENV !== 'production';
const app=next({dev,hostname,port});

const handle=app.getRequestHandler();

app.prepare().then(()=>{
    const server=http.createServer(express_app);
    const wss=new WebSocketServer({server});
   
    ws(wss);
    
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