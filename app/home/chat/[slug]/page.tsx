"use client";

import { useEffect, useState } from "react";




export default function Chat({params}:{params:{slug:string}}){
    const [messages,setMessages]=useState();
    useEffect(()=>{
        async function fetch_messages(){
            try{
                const resp=await fetch(`http://localhost:3000/chat/getMessage/${params.slug}`);
                const data=await resp.json();
                // Parse this data using zod.
                console.log(data)
            }catch(err)
            {
                alert(err);
            }
        }
        fetch_messages();
    },[])
    return <div>Soon you will able to chat here.</div>

}