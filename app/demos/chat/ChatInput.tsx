import { useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { InputGroup, InputGroupAddon, InputGroupTextarea } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { CornerDownLeft, FileExclamationPoint, FileIcon, Paperclip, Square, X } from "lucide-react";
import { UnifiedCDNFileJSON } from "unified-cdn-api/types";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Spinner } from "@/components/ui/spinner";
import deleteFile from "../actions/deleteFile";
import { useAPIContext } from "@/components/providers/api-provider";
import { APIError } from "unified-cdn-api/errors";
import { toast } from "@/components/ui/toast";
import { ChatStatus, generateId } from "ai";
import { convertFileTypesToList, convertMimeToReadable, convertUnit } from "unified-cdn-api/helpers";

type SendMessage = ReturnType<typeof useChat>["sendMessage"];

export default function ChatInput({ sendMessage, status, stop }: { sendMessage: SendMessage, status: ChatStatus, stop: () => void }) {
    const [dismissedChatSaving, setDismissedChatSaving] = useState(false);
    const [input, setInput] = useState("");
    const [files, setFiles] = useState<({status: string} & Pick<UnifiedCDNFileJSON, "id" | "name" | "contentType" | "size" | "viewUrl">)[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const api = useAPIContext();
    function submitMessage(){
        if ((!input.trim() && files.filter((x)=> x.status == "done").length == 0) || status == "streaming" || status == "submitted" ) return;
        sendMessage({ text: input.trim(), files: files.filter((file)=> file.status == "done").map((file)=> ({type: "file", mediaType: file.contentType, url: file.viewUrl, filename: file.name}))});
        setInput("");
        setFiles([]);
    }
    return <form className="contents" onSubmit={(e)=> {
        e.preventDefault();
        submitMessage();
    }}>
        <InputGroup className={`max-w-[700px] w-full ${dismissedChatSaving && "pt-1"} rounded-4xl mt-6`}>
            {!dismissedChatSaving && <InputGroupAddon align="block-start" className="bg-accent pb-2 px-3 rounded-t-4xl">
                <p>Chats are not saved, and clear when u leave this page.</p>
                <div className="flex-1"/>
                <Button variant="ghost" size="icon-xs" onClick={()=> setDismissedChatSaving(true)} type="button">
                    <X/>
                </Button>
            </InputGroupAddon>}
            {files.length > 0 && <InputGroupAddon align="block-start" className="px-3">
                <div className="overflow-auto flex gap-2 scroll-fade-x no-scrollbar">
                    {files.map((file)=>{
                        return <Attachment state={file.status == "loading" ? "uploading" : file.status == "failed" ? "error" : "done"} key={file.id} orientation={"horizontal"}>
                            <AttachmentMedia variant={file.contentType.startsWith("image/") ? "image" : "icon"}>
                                {file.status == "loading" ? <Spinner /> : file.status == "failed" ? <FileExclamationPoint/> : file.contentType.startsWith("image/") ? <img src={file.viewUrl} /> : <FileIcon/>}
                            </AttachmentMedia>
                            <AttachmentContent>
                                <AttachmentTitle className="ellipsis max-w-[200px]" title={file.name}>{file.name}</AttachmentTitle>
                                <AttachmentDescription>{file.status == "failed" ? "Failed to upload." : convertMimeToReadable(file.contentType) + " | " + convertUnit(file.size).text.toUpperCase()}</AttachmentDescription>
                            </AttachmentContent>
                            <AttachmentActions>
                                <AttachmentAction disabled={file.status == "loading"} onClick={async()=>{
                                    setFiles((files)=> files.map((f)=> f === file ? {...f, status: "loading"} : f));
                                    try {
                                        if (file.status == "done"){
                                            await deleteFile({fileId: file.id, apiUrl: api.apiKey, apiKey: api.apiKey});
                                        }
                                    } catch (error){
                                        if (error instanceof APIError){
                                            toast.add({ 
                                                title: "Error deleting file",
                                                description: `${error.name}: ${error.message}`,
                                                type: "error",
                                            });
                                        } else {
                                            console.error("Error deleting file:", error);
                                            toast.add({
                                                title: "Error deleting file",
                                                description: `Error deleting file: ${error instanceof Error ? error.message : "Unknown error"}`,
                                                type: "error",
                                            });
                                        }
                                    } finally {
                                        setFiles((files)=> files.filter((f)=> f.id != file.id));
                                    }
                                }}>
                                    <X />
                                </AttachmentAction>
                            </AttachmentActions>
                        </Attachment>
                    })}
                </div>
            </InputGroupAddon>}
            <InputGroupTextarea value={input} onChange={(e)=> setInput(e.target.value)} placeholder="Type a message..." className="min-h-[0px] px-3 pt-3" onKeyDown={(e)=>{
                    if (e.key == "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submitMessage();
                    }
                }}
            />
            <InputGroupAddon align="block-end" className="p-3">
                <input ref={fileInputRef} type="file" multiple accept={convertFileTypesToList(["images", "documents", "text"]).join(",")} className="hidden" onChange={async (e)=>{
                    if (!e.target.files || e.target.files.length === 0) return;
                    if (!api.ucdnClient) {
                        toast.add({
                            title: "Error uploading files",
                            description: "API client not initialized.",
                            type: "error",
                        });
                        return;
                    }
                    const files = Array.from(e.target.files);
                    e.target.value = "";
                    setFiles((prev)=> [...prev, ...files.map((file)=> ({status: "loading", id: generateId(), name: file.name, size: file.size, contentType: file.type, viewUrl: ""}))]);
                    try {
                        const {uploads, failed} = await api.ucdnClient.uploadFiles(files, {apiUrl: api.apiKey, apiKey: api.apiKey});
                        if (failed.length > 0){
                            toast.add({
                                title: "Error uploading files",
                                description: `Failed to upload ${failed.length} files.`,
                                type: "error",
                            });
                        }
                        setFiles((prev)=> prev.map((file)=> {
                            if (uploads.some((upload)=> upload.name == file.name)) {
                                const upload = uploads.find((upload)=> upload.name == file.name);
                                return {...upload!, status: "done"};
                            } else if (failed.some((fail)=> fail.filename == file.name)) {
                                return  {...file, status: "failed"};
                            } else {
                                return {...file}
                            }
                        }));
                    } catch (error){
                        setFiles((prev)=> prev.map((file)=> files.some((x)=> x.name == file.name) ? {...file, status: "failed"} : file));
                        if (error instanceof APIError){    
                            if (error.message.includes("All file uploads failed")){
                                return
                            }
                            toast.add({ 
                                title: "Error uploading files",
                                description: `${error.name}: ${error.message}`,
                                type: "error",
                            });
                        } else {
                            console.error("Error uploading files:", error);
                            toast.add({
                                title: "Error uploading files",
                                description: `Error uploading files: ${error instanceof Error ? error.message : "Unknown error"}`,
                                type: "error",
                            });
                        }
                    }
                }}/>
                <Button variant="outline" className="text-muted-foreground rounded-full" size="icon" type="button" onClick={(e)=>{
                    fileInputRef.current?.click();
                }}>
                    <Paperclip/>
                </Button>
                <div className="flex-1"/>
                <Button type="submit" className="rounded-full" size="icon" disabled={(status == "ready" || status == "error") && ((!input.trim() && files.filter((x)=> x.status == "done").length == 0) || files.some((file)=> file.status == "loading"))} onClick={()=>{
                    if (status == "streaming" || status == "submitted") {
                        stop();
                    }
                }}>
                    {(status == "streaming" || status == "submitted") ? <Square/> : <CornerDownLeft/>}
                </Button>
            </InputGroupAddon>
        </InputGroup>
    </form>
}