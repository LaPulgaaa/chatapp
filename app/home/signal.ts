const BASE_URL = "ws://localhost"
const PORT = 3001;

type BufferedMessage = {
    id: number,
    message: string
};

export class Signal{
    private static instance: Signal;
    private ws:WebSocket;
    private initialised: boolean = false;
    private buffered_messages: BufferedMessage[] = [];
    private callbacks: Record<string, (message: string)=>void> = {};
    private id: number;
    private backoff_interval:number = 1000;

    private constructor(){
        this.ws = new WebSocket(`${BASE_URL}:${PORT}`);
        this.id = 1;
        this.init_ws();
    }

    static get_instance(){
        if(!Signal.instance){
            Signal.instance = new Signal();
        }

        return Signal.instance;
    }

    private init_ws(){
        this.ws.onopen = () =>{
            this.initialised = true;
            this.buffered_messages.map(({message})=>{
                this.ws.send(message);
            })
            console.log("connection made with the server")
        }

        this.ws.onmessage = (event) => {
            const payload = JSON.parse(`${event.data}`);
            const type:string = payload.type;
            const data:string = payload.data;

            const target_callback = this.callbacks[type];
            target_callback(data);
        }

        this.ws.onclose = () =>{
            setTimeout(()=>{
                this.backoff_interval += 1000;
                this.init_ws();
            },this.backoff_interval)
        }
    }

    SUBSCRIBE(room_id: string, user_id?: string, username?: string){
        const msg = JSON.stringify({
            type: "join",
            payload: {
                roomId: room_id,
                userId: user_id,
                username,
            }
        });
        if(this.initialised === false){
            this.buffered_messages.push({
                id: this.id++,
                message: msg,
            });
            return ;
        }
        this.ws.send(msg);

    }

    UNSUBSCRIBE(room_id: string, username?: string){
        const msg = JSON.stringify({
            type: "leave",
            payload: {
                roomId: room_id,
                username
            }
        });

        if(this.initialised === false){
            this.buffered_messages.push({
                id: this.id++,
                message: msg,
            });
            return ;
        }

        this.ws.send(msg);
    }

    REGISTER_CALLBACK( key: string, callback:(message: string)=>void ){
        this.callbacks = {...this.callbacks, [key]: callback};
    }

    DEREGISTER(key: string){
        delete this.callbacks[key];
    }

    SEND(payload: string){
        this.ws.send(payload);
    }

    CLOSE(){
        //@ts-ignore
        delete Signal.instance;
    }
}