'use client'

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function ChatLayout({children}:{children:React.ReactNode}){
    return (
        <section>
       <div>
            <Navbar/>
            <div className="ml-8 my-4 grid lg:grid-cols-5  h-full pb-24 m-2">
                <Sidebar/>
                <div className="lg:col-span-4 mr-4 ml-2 pt-2">{children}</div>
            </div>
        </div>
        </section>
    )

}

