import { useState } from "react";
import { APIContextType } from "@/components/providers/api-provider";
import { getPhotos } from "./actions/getPhotos";
import { UnifiedCDNFileJSON } from "unified-cdn-api/types";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ExternalLink, MoreHorizontal, Trash, X } from "lucide-react";
import { renamePhoto } from "./actions/renamePhoto";
import { toast } from "@/components/ui/toast";
import { APIError } from "unified-cdn-api/errors";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { deletePhoto } from "./actions/deletePhoto";


export default function PhotoCard({photo, api, setPhotos}: {photo: UnifiedCDNFileJSON, api: APIContextType, setPhotos: (photos: UnifiedCDNFileJSON[]) => void}){
    const [loading, setLoading] = useState(true);
    const [opened, setOpened] = useState(false);
    const [formerName, setFormerName] = useState(photo.name);
    const [photoName, setPhotoName] = useState(photo.name);
    const [editingForm, setEditingForm] = useState(false);
    const [saving, setSaving] = useState(false);
    function PhotoCardDropdown({children}: {children: React.ReactNode}){
        return <DropdownMenu>
            <DropdownMenuTrigger render={<span className="ml-auto"/>} nativeButton={false}>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={(e)=>{
                        e.stopPropagation();
                        window.open(photo.viewUrl, "_blank");
                    }}><ExternalLink/> Open</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={async(e)=>{
                        e.stopPropagation();
                        setSaving(true);
                        toast.promise(new Promise<void>(async(resolve, reject) => {
                            try {
                                await deletePhoto({apiUrl: api.apiUrl || undefined, apiKey: api.apiKey || undefined, fileId: photo.id});
                                const newPhotos = await getPhotos({apiUrl: api.apiUrl || undefined, apiKey: api.apiKey || undefined});
                                setPhotos(newPhotos);
                                resolve();
                            } catch (error){
                                setPhotoName(formerName);
                                if (error instanceof APIError){
                                    reject(`${error.name}: ${error.message}`);
                                } else {
                                    console.error("Error deleting file:", error);
                                    reject(`Error deleting file: ${error instanceof Error ? error.message : "Unknown error"}`);
                                }
                            } finally {
                                setSaving(false);
                            }
                        }),
                        {
                            loading: "Deleting file...",
                            success: () => `Deleted ${formerName}.`,
                            error: (error) => error,
                        })
                    }}><Trash/> Delete</DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    }
    return <AnimatePresence>
        {!opened ? <motion.div layoutId={photo.id}  className={`relative aspect-3/2 rounded-lg overflow-hidden group cursor-pointer ${loading && 'bg-muted animate-pulse'} transition-colors`} onClick={()=> setOpened(true)} whileHover={{scale: 1.02}} transition={{type: "spring", stiffness: 500, damping: 38}}>
            <motion.img initial={{opacity: 0}} animate={{opacity: loading ? 0 : 1}} transition={{duration: 0.2}}  src={photo.viewUrl} alt={photo.name} loading="lazy" onLoad={()=> setLoading(false)} className="w-full h-full object-cover rounded-lg"/>
            <div className="absolute w-full bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white text-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 flex">
                <p>{formerName}</p>
                <PhotoCardDropdown>
                    <Button variant="ghost" size="icon-xs" onClick={(e)=>{
                        e.stopPropagation();
                    }}>
                        <MoreHorizontal/>
                    </Button>
                </PhotoCardDropdown>
            </div>
        </motion.div>
        : <>
            <div className="aspect-3/2"/>
            <motion.div key={photo.id+"backdrop"} className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} onClick={()=> {
                if (!saving){
                    setOpened(false)
                    setPhotoName(formerName);
                }
            }}/>
            <motion.div layoutId={photo.id} className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg max-w-[95vw] max-h-[95vh] group overflow-hidden"  transition={{type: "spring", stiffness: 500, damping: 38}}>
                <Button variant="ghost" size="icon" disabled={saving} className="absolute top-1 right-1 md:top-4 md:right-4 z-50" onClick={()=> {
                    if (!saving){
                        setOpened(false)
                        setPhotoName(formerName);
                    }
                }}>
                    <X/>
                </Button>
                <motion.img src={photo.viewUrl} alt={photo.name} className="rounded-lg max-h-[90vh] max-w-[90vw] md:max-h-[80vh] max-w-[80vw] lg:max-h-[70vh] lg:max-w-[70vw]" onClick={()=>{
                    if (!saving){
                        setOpened(false);
                        setPhotoName(formerName);
                    }
                }}/>
                <div className={`cursor-default absolute bottom-0 left-0 pt-12 w-full bg-gradient-to-t from-black/70 to-transparent p-4 text-white rounded-b-lg ${editingForm ? "opacity-100" : "opacity-100 md:opacity-0 translate-y-0 md:translate-y-2"} group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 flex items-center`}>
                    <form className='w-full' onSubmit={(e)=>{
                        e.preventDefault();
                        setSaving(true);
                        toast.promise(new Promise<{finalName: string}>(async(resolve, reject) => {
                            try {
                                const finalName = await renamePhoto({apiUrl: api.apiUrl || undefined, apiKey: api.apiKey || undefined, fileId: photo.id, newName: photoName});
                                setFormerName(finalName);
                                resolve({finalName});
                            } catch (error){
                                setPhotoName(formerName);
                                if (error instanceof APIError){
                                    reject(`${error.name}: ${error.message}`);
                                } else {
                                    console.error("Error renming file:", error);
                                    reject(`Error renming file: ${error instanceof Error ? error.message : "Unknown error"}`);
                                }
                            } finally {
                                setSaving(false);
                            }
                        }),
                        {
                            loading: "Renaming file...",
                            success: (data) => `Renamed photo to ${data.finalName}.`,
                            error: (error) => error,
                        })
                    }}>
                        <input disabled={saving} onFocus={()=> setEditingForm(true)} onBlur={()=> setEditingForm(false)} className="text-lg font-semibold focus:outline-none w-full" value={photoName} onChange={(e)=> setPhotoName(e.target.value)}/>
                        <p className="text-sm text-muted-foreground">{editingForm ? "Press Enter to save" : photo.contentType}</p>
                    </form>
                    <PhotoCardDropdown>
                        <Button variant="ghost" size="icon-xs" onClick={(e)=>{
                            e.stopPropagation();
                        }}>
                            <MoreHorizontal/>
                        </Button>
                    </PhotoCardDropdown>
                </div>
            </motion.div>   
        </>}
    </AnimatePresence>
}