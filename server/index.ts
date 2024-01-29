// import { WebSocketServer } from "ws";
// import http from 'http'



// const users:{
//     [userId:string]:{
//         roomId:string,
//         ws:any
//     }
// }={};

// function connectSocket(){
//     const server=http.createServer();
//     const wss=new WebSocketServer({server});
//     wss.on('connection',(ws,req)=>{
//         ws.on("message",(message)=>{
//             // const data=JSON.parse(`${message}`);
//             console.log(message);
//         })
//     })

//     server.listen(8080,()=>{
//         console.log("this is websocket connection!!!");
//     })
// }

// export default connectSocket;

