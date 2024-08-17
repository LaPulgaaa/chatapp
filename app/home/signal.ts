const BASE_URL = "ws://localhost"
const PORT = 3001;

export class Signal{
    private static instance: Signal;
    private ws:WebSocket;
    private initialised: boolean = false;
    private buffered_messages: string[] = [];
    private callback: ((event:MessageEvent)=>void) | undefined;

    private constructor(){
        this.ws = new WebSocket(`${BASE_URL}:${PORT}`);
        this.ws.onopen = () =>{
            this.initialised = true;
            this.buffered_messages.map((msg)=>{
                this.ws.send(msg);
            })
            console.log("connection made with the server")
        }

        this.ws.onmessage = (event) => {
            this.callback!(event);
        }

        this.ws.onclose = () =>{
            let interval = 1000;
            setTimeout(()=>{
                interval += 1000;
                this.ws.onopen = () =>{
                    console.log("reconnected");
                }
            },interval)
        }
    }

    static get_instance(){
        if(!Signal.instance){
            Signal.instance = new Signal();
        }

        return Signal.instance;
    }

    SUBSCRIBE(room_id: string){
        const msg = JSON.stringify({
            type: "join",
            payload: {
                roomId: room_id
            }
        });
        if(this.initialised === false){
            this.buffered_messages.push(msg);
            return ;
        }
        this.ws.send(msg);

    }

    UNSUBSCRIBE(room_id: string){
        const msg = JSON.stringify({
            type: "leave",
            payload: {
                roomId: room_id
            }
        });

        if(this.initialised === false){
            this.buffered_messages.push(msg);
            return ;
        }

        this.ws.send(msg);
    }

    REGISTER_CALLBACK(callback:(event:MessageEvent)=>void){
        this.callback = callback;
    }

    DEREGISTER(){
        delete this.callback;
    }

    SEND(payload: string){
        this.ws.send(payload);
    }

    CLOSE(){
        //@ts-ignore
        delete Signal.instance;
    }
}