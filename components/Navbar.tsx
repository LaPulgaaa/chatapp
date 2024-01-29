import { Button } from "./ui/button"


export default function Navbar(){
    return <div className="p-4 font-bold flex justify-between cursor-pointer">
        <h2>chatcity</h2>
        <div className="flex justify-between">
        <Button variant={"ghost"}>Login</Button>
        <Button variant="ghost">Signup</Button>
        </div>
    </div>
}