'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Globe, Server } from "lucide-react";
import APIServerSwitcher from "./APIServerSwitcher";

export default function DemoLayout({children}: {children: React.ReactNode}){
    const pathname = usePathname();
    return <div>
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
        
    </div>
}