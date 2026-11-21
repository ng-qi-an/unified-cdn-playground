'use client';
import { Suspense, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useAPIContext } from "@/components/providers/api-provider";
import Editor from "./Editor";
import SamplePhotos from "../photos/SamplePhotos";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
export default function EditorPage() {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const [scrollYProgress, setScrollYProgress] = useState(0);
    const api = useAPIContext();
    useEffect(()=>{
        if (!scrollContainerRef.current) return;
        function scrollFunction(){
            setScrollYProgress(Math.min(1, (scrollContainerRef.current?.scrollTop || 0) / 100));
        }
        scrollContainerRef.current.addEventListener("scroll", scrollFunction);
        return ()=>{
            scrollContainerRef.current?.removeEventListener("scroll", scrollFunction)
        }
    }, [scrollContainerRef])
    return <div className="h-screen w-screen relative">
        <motion.div style={{opacity: 1 - scrollYProgress}}>
            <div className="shrink-0 h-[30vh]"/>
            <div className="flex flex-col items-center mb-10">
                <h1 className="text-4xl font-semibold">Document Editor</h1>
                <p className="text-muted-foreground mt-2">Add images in your documents</p>
            </div>
        </motion.div>
        <div ref={scrollContainerRef} className="h-screen flex flex-col items-center w-full overflow-auto absolute top-0 left-0 px-2 md:px-4">
            <div className="h-[calc(30vh+100px)] shrink-0"/>
            <div className="shrink-0 min-h-[calc(70vh-100px)] bg-card w-full rounded-t-4xl max-w-[1000px] p-4">
                <div className="flex items-center w-full gap-2 mb-4 pb-2 border-b">
                    <p className="text-sm text-muted-foreground">This editor is not saved, and clears when you leave the page.</p>
                    <div className="flex-1"/>
                    <SamplePhotos>
                        <Button size="lg" variant="ghost">Samples <ChevronDown/> </Button>
                    </SamplePhotos>
                </div>
                {api.ucdnClient && <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                    <Editor api={api}/>
                </Suspense>}
            </div>
        </div>
    </div>
}