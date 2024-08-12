import jwt from "jsonwebtoken";
import assert from "minimalistic-assert";

type Store = {
    id: string,
    expiry: number
}

export class Cache{
    private member_id_store:Map<string, Store>;
    private static instance:Cache;

    private constructor(){
        this.member_id_store = new Map();
    }

    static get_instance(){
        if(!this.instance){
            this.instance = new Cache();
        }

        return this.instance;
    }

    set_member_id(token: string){
        const creds = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET!);
        assert(typeof creds !== "string");

        const store = {
            id: creds.id,
            expiry: creds.exp!*1000,
        }

        this.member_id_store.set(token, store);

    }

    get_member_id(token: string){
        const store = this.member_id_store.get(token);

        console.log(store);

        if(store === undefined)
            return undefined;
        else if(store.expiry < Date.now()){
            this.member_id_store.delete(token);
            return undefined;
        }

        return store.id;
    }

}