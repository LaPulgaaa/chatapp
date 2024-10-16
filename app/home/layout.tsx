'use client'

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CandleSidebar from "@/components/candleSidebar";
import Connect from "./connect";

export default function ChatLayout({children}:{children:React.ReactNode}){
    return (
        <div>
        <div>
            <Navbar/>
            <div className="flex divide-x h-full ml-4 my-4 mr-12 pb-24">
                <div>
                    <CandleSidebar/>
                    <Sidebar/>
                </div>
                <div className = {`w-5/6 mr-4 ml-2 pt-2`}>{children}</div>
            </div>
            </div>
            <Connect/>
        </div>
    )

}

