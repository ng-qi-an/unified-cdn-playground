'use client';
import { useAPIContext } from "@/components/providers/api-provider";
import { UnifiedCDNFileJSON } from "unified-cdn-api/types";
import PhotoCard from "./PhotoCard";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Image } from "lucide-react";
import { useState } from "react";

function getDroppedUrl(e: React.DragEvent): string | null {
    const dt = e.dataTransfer;
    if (!dt) return null;
    // Primary: URI list (what dragging an <img> produces — NOT a File)
    const uriList = dt.getData("text/uri-list")
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s && !s.startsWith("#"));
    if (uriList.length > 0) return uriList[0];
    // Fallback: HTML fragment like <img src="...">
    const html = dt.getData("text/html");
    const srcMatch = html.match(/src=["']([^"']+)["']/i);
    if (srcMatch) return srcMatch[1];
    const plain = dt.getData("text/plain").trim();
    if (/^(https?:\/\/|\/samples\/)/i.test(plain)) return plain;
    return null;
}

export default function PhotosGrid({photos, setPhotos, loading, onFilesDropped}: {photos: UnifiedCDNFileJSON[], setPhotos: (photos: UnifiedCDNFileJSON[]) => void, loading: boolean, onFilesDropped: (files: File[]) => void}){
    const api = useAPIContext();
    const [isDragging, setIsDragging] = useState(false);

    return <>
        <div
            onDragOver={(e) => { 
                e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setIsDragging(true); 
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={async(e)=>{
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files.length > 0) {
                    onFilesDropped(Array.from(e.dataTransfer.files));
                    return;
                }
                const url = getDroppedUrl(e);
                if (!url) return;
                try {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`Could not fetch image (${res.status})`);
                    const blob = await res.blob();
                    const pathname = new URL(url, window.location.href).pathname;
                    const name = decodeURIComponent(pathname.split("/").pop() || "sample.jpg");
                    onFilesDropped([new File([blob], name, { type: blob.type || "image/jpeg" })]);
                } catch (error) {
                    console.error("Could not turn dropped image URL into a file:", error);
                }
            }}
            className={`w-full shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3 rounded-lg transition-colors ${isDragging ? "outline-2 outline-dashed outline-primary bg-primary/5" : ""} min-h-[calc(70vh-200px)]`}
        >
            {loading ? <>
                {[...Array(6)].map((_, i)=>{
                    return <div key={i} className="relative aspect-3/2 rounded-lg overflow-hidden animate-pulse bg-muted"/>
                })}
            </>
            : photos.length > 0 ? photos.map((photo)=>{
                return <PhotoCard key={photo.id} photo={photo} api={api} setPhotos={setPhotos}/>
            }) : <Empty className="col-span-3 h-full border border-dashed">
                <EmptyMedia variant="icon">
                    <Image/>
                </EmptyMedia>
                <EmptyHeader>
                    <EmptyTitle>No photos uploaded yet</EmptyTitle>
                    <EmptyDescription>
                        Drag and drop photos here to upload them, or click the upload button above.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>}
        </div>
    </>
}