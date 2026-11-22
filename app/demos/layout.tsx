'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import APIServerSwitcher from "./APIServerSwitcher";
import { useAPIContext } from "@/components/providers/api-provider";
import { ExternalLink, LayoutDashboard, Moon, Sun } from "lucide-react";
import SourcePopup from "./SourcePopup";
import { useTheme } from "next-themes";

export default function DemoLayout({children}: {children: React.ReactNode}){
    const pathname = usePathname();
    const api = useAPIContext();
    const { resolvedTheme, setTheme } = useTheme();
    return <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{type: "keyframes", ease: "easeOut"}} className="fixed">
        <div className="fixed left-4 top-4 z-60 flex items-center gap-2 p-1 bg-background rounded-full">
            <APIServerSwitcher/>
        </div>
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-60 flex items-center gap-1 p-1 bg-background rounded-full">
            <Link href="/demos/photos" className={`px-4 py-2 rounded-full text-sm cursor-pointer relative ${pathname == "/demos/photos" ? "text-foreground font-medium" : "hover:bg-accent/50 text-muted-foreground"}`}>
                Photos
                {pathname == "/demos/photos" && <motion.div layoutId="demoModeTabBg" className="absolute top-0 left-0 w-full h-full bg-accent rounded-full -z-1" transition={{type: "spring", damping: 22, stiffness: 200}}/>}
            </Link>
            <Link href="/demos/editor" className={`px-4 py-2 rounded-full text-sm cursor-pointer relative ${pathname == "/demos/editor" ? "text-foreground font-medium" : "hover:bg-accent/50 text-muted-foreground"}`}>
                Editor
                {pathname == "/demos/editor" && <motion.div layoutId="demoModeTabBg" className="absolute top-0 left-0 w-full h-full bg-accent rounded-full -z-1" transition={{type: "spring", damping: 22, stiffness: 200}}/>}
            </Link>
            <Link href="/demos/chat" className={`px-4 py-2 rounded-full text-sm cursor-pointer relative ${pathname == "/demos/chat" ? "text-foreground font-medium" : "hover:bg-accent/50 text-muted-foreground"}`}>
                Chat
                {pathname == "/demos/chat" && <motion.div layoutId="demoModeTabBg" className="absolute top-0 left-0 w-full h-full bg-accent rounded-full -z-1" transition={{type: "spring", damping: 22, stiffness: 200}}/>}
            </Link>
        </div>
        {children}
        <div className="fixed right-4 top-4 z-60 flex items-center gap-2 p-1 bg-background rounded-full">
            <Link href={(api.apiUrl || "https://demo.unified-cdn.ngqian.com")} target={"_blank"} className={`w-9 sm:w-max sm:px-4 py-2 rounded-full text-sm cursor-pointer relative text-muted-foreground hover:bg-accent/50 aria-expanded:bg-accent aria-expanded:text-foreground active:text-foreground active:bg-accent flex items-center justify-center gap-2 h-9`} title="Open the dashboard Playground is connected to.">
                <LayoutDashboard className="size-4 block sm:hidden"/>
                <span className="hidden sm:block">Dashboard</span>
                <ExternalLink className="hidden sm:block size-4"/>
            </Link>
        </div>
        <div className="fixed left-4 bottom-4 z-60 flex items-center gap-2 p-1 bg-background rounded-full">
            <button className={`w-9 py-2 rounded-full text-sm cursor-pointer relative text-muted-foreground hover:bg-accent/50 aria-expanded:bg-accent aria-expanded:text-foreground active:text-foreground active:bg-accent flex items-center justify-center gap-2 h-9`} title="Change site theme" onClick={()=>{
                setTheme(resolvedTheme == "light" ? "dark" : "light");
            }}>
                {resolvedTheme == "light" ? <Moon className="size-4"/> : <Sun className="size-4"/>}
            </button>

        </div>
        <div className="fixed right-4 bottom-4 z-60 flex items-center gap-2 p-1 bg-background rounded-full">
            <SourcePopup/>
        </div>
    </motion.div>
}