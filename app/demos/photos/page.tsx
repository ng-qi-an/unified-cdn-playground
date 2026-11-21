'use client';
import { useEffect, useRef, useState } from "react";
import PhotosGrid from "./PhotosGrid";
import { motion } from "motion/react";
import { useAPIContext } from "@/components/providers/api-provider";
import { ChevronDown, Server, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnifiedCDNFileJSON } from "unified-cdn-api/types";
import { getPhotos } from "../actions/getPhotos";
import SamplePhotos from "./SamplePhotos";
import { toast } from "@/components/ui/toast";
import { APIError } from "unified-cdn-api/errors";
export default function PhotosPage() {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const [scrollYProgress, setScrollYProgress] = useState(0);
    const [photos, setPhotos] = useState<UnifiedCDNFileJSON[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const api = useAPIContext();
    function handleUploadFiles(files: File[]){
        if (files.length === 0) return;
        setUploading(true);
        toast.promise(new Promise<{uploads: UnifiedCDNFileJSON[]; failed: {filename: string, reason: string}[]}>(async(resolve, reject) => {
            try {
                const response = await api.ucdnClient?.uploadFiles(files);
                if (!response) throw new Error("No client available to upload files.");
                setPhotos((prev)=> [...response.uploads, ...prev])
                resolve(response);
            } catch (error){
                if (error instanceof APIError){
                    reject(`${error.name}: ${error.message}`);
                } else {
                    console.error("Error uploading file:", error);
                    reject(`Error uploading file: ${error instanceof Error ? error.message : "Unknown error"}`);
                }
            } finally {
                setUploading(false);
            }
        }),
        {
            loading: `Uploading ${files.length} files...`,
            success: ({uploads, failed}) => `Uploaded ${uploads.length} files. ${failed.length > 0 ? `${failed.length} failed.` : ""}`,
            error: (error) => error,
        })
    }
    useEffect(()=>{
        if (api.ucdnClient){
            (async()=>{
                setLoading(true);
                console.log("Fetching photos with apiUrl", api.apiUrl, "and apiKey", api.apiKey);
                const photos = await getPhotos({apiUrl: api.apiUrl || undefined, apiKey: api.apiKey || undefined});
                setPhotos(photos);
                setLoading(false);
            })();
        }
    }, [api.ucdnClient])
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
                <h1 className="text-4xl font-semibold">Photos Library</h1>
                <p className="text-muted-foreground mt-2">Collection of photos uploaded by users</p>
            </div>
        </motion.div>
        <div ref={scrollContainerRef} className="h-screen flex flex-col items-center w-full overflow-auto absolute top-0 left-0 px-2 md:px-4">
            <div className="h-[calc(30vh+100px)] shrink-0"/>
            <div className="shrink-0 min-h-[calc(70vh-100px)] bg-card w-full rounded-t-4xl max-w-[1000px] p-4">
                <div className="flex items-center w-full gap-2">
                    <p className="text-sm text-muted-foreground">Photos are automatically cleared by 24 hours</p>
                    <div className="flex-1"/>
                    <SamplePhotos>
                        <Button size="lg" variant="ghost">Samples <ChevronDown/> </Button>
                    </SamplePhotos>
                    <Button size="lg" onClick={()=>{
                        if (fileInputRef.current && !loading){
                            fileInputRef.current.click();
                        }
                    }}><Upload/> Upload</Button>
                    <input type="file" multiple accept="image/*" disabled={loading || uploading} className="hidden" ref={fileInputRef} onChange={(e)=>{
                        if (!e.target.files || e.target.files.length === 0) return;
                        const files = Array.from(e.target.files);
                        fileInputRef.current!.value = "";
                        handleUploadFiles(files);
                    }}/>
                </div>
                <PhotosGrid photos={photos} setPhotos={setPhotos} loading={loading} onFilesDropped={handleUploadFiles}/>
            </div>
        </div>
    </div>
}