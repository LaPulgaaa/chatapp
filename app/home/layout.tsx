'use client'

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { mainSidebarState } from "@/lib/store/atom/mainSidebar";
import { useRecoilValue } from "recoil";
import CandleSidebar from "@/components/candleSidebar";

export default function ChatLayout({children}:{children:React.ReactNode}){
    const hidden = useRecoilValue(mainSidebarState);
    return (
        <div>
        <div>
            <Navbar/>
            <div className="ml-4 my-4 flex  h-full pb-24 ml-2 divide-x">
                <div>
                    {
                        hidden ? <CandleSidebar/> : <Sidebar/>
                    }
                </div>
                <div className = {`${!hidden ? "w-5/6" : "w-screen"}  mr-4 ml-2 pt-2`}>{children}</div>
            </div>
            </div>
        </div>
    )

}

