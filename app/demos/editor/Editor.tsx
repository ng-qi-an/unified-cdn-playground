'use client';
import { APIContextType } from "@/components/providers/api-provider";
import { toast } from "@/components/ui/toast";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { APIError } from "unified-cdn-api/errors";

export default function Editor({api}: {api: APIContextType}){
    const editor = useCreateBlockNote({
        uploadFile: async (file: File)=>{
            if (!api.ucdnClient) {
                toast.add({
                    title: "Upload failed",
                    description: "No API client available.",
                    type: "error",
                })
                throw new Error("No API client available.");
            }
            try {
                const { uploads, failed } = await api.ucdnClient.uploadFiles([file]);
                if (failed.length > 0) {
                    toast.add({
                        title: "Upload failed",
                        description: `Failed to upload ${failed.length} files.`,
                        type: "error",
                    })
                    throw new Error(`Failed to upload ${failed.length} files.`);
                }
                return uploads[0].viewUrl;
            } catch (error) {
                if (error instanceof APIError){
                    toast.add({
                        title: "Upload failed",
                        description: `${error.name}: ${error.message}`,
                        type: "error",
                    })
                } else if (error instanceof Error){
                    console.error("Error uploading file:", error);
                    toast.add({
                        title: "Upload failed",
                        description: "An error occurred while uploading the file.",
                        type: "error",
                    });
                }
                throw error;
            }
        }
    });
    return <BlockNoteView
        editor={editor}
    />
}